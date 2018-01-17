import { queryNotices } from '../services/api';
import { getUserMenu } from '../core/service/global';
import {getRouterData} from "../core/common/router";
export default {
  namespace: 'global',
  state: {
    collapsed: false,
    currentUser: {},
    notices: [],
    routerData:[],
    menus: [{
      name: 'dashboard',
      icon: 'dashboard',
      path: 'dashboard',
    }],
  },
  effects: {
    // 获取菜单
    *fetchMenus({ payload, app }, { put, call }) {
      const response = yield call(getUserMenu, payload);
      const routerData = getRouterData(app, response);
      // 查询数据
      yield put({
        type: 'updateState',
        payload: {
          routerData,
          menus: response
        },
      });
    },
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
