import modelExtend from 'dva-model-extend'

const model = {
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};

const pageModel = modelExtend(model, {
  state: {
    loading: true,
    data: {
      list: [],
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        current: 1,
        total: 0,
      },
    },
  },

  reducers: {
    // 查询成功
    querySuccess(state, {payload}) {
      const {list, pagination} = payload;
      return {
        ...state,
        list,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
      }
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    showLoading(state) {
      return {
        ...state,
        loading: true,
      };
    },
    hideLoading(state) {
      return {
        ...state,
        loading: false,
      };
    },
  },
});

module.exports = {
  model,
  pageModel,
};