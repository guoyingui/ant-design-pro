import modelExtend from 'dva-model-extend';
import { model } from '../../../../core/common/BaseModel';
import { message } from 'antd';
import { editOrg, getOrg, listOrg, deleteOrg } from '../service/Organization';

export default modelExtend(model, {
  namespace: 'organization',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 查询
    *listOrg({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(listOrg, payload);
      if(response && response.data){
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    // 新增/新增子节点
    *addOrg({ payload }, { call, put }) {
      // 有id时为新增下级，加载父级节点相关信息
      yield put({
        type: 'updateState',
        payload: {
          ...payload
        }
      })
    },
    // 编辑按钮
    *editOrg({ payload }, { call, put }){
      const response = yield call(getOrg, payload);
      if(response && response.data){
        yield put({
          type: 'updateState',
          payload: {
            modalType: 'edit',
            currentItem: response.data
          }
        })
      }
    },
    // 保存一条组织信息
    *saveOrg({ payload }, { call, put }){
      const response = yield call(saveOrg, payload);
      //  关闭窗口 - 提示成功 - 加载数据
      yield put({
        type: 'updateState',
        payload: {
          modalType: '',
          currentItem: {},
          data: response
        },
      });
      message.success('提交成功');
    },
    // 更改可用状态
    *changeStatus({ payload }, { call, put }) {
      const response = yield call(editOrg, payload);
      if(response) {
        payload.record.status = payload.status;
        yield put({
          type: 'updateState',
          currentItem: payload.record
        });
      }
    },
    // 删除数据
    *deleteOrg({ payload, callback }, { call, put }) {
      // 查询数据
      const response = yield call(deleteOrg, payload);
      // 只有返回成功时才刷新
      if(response && response.success){
        // 从当前数据对象中找到响应ID记录删除值
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
            selectedRowKeys: []
          },
        });
        if(callback) {
          callback();
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            loading: { global: false}
          },
        });
      }
    },
  },
});
