import React, { Component } from 'react';
import {
  Table,
  Alert,
  Popconfirm,
  Divider,
  Badge,
  Button,
  Card,
  Input,
  Row,
  Col,
  message,
  notification,
} from 'antd';
import { hasChildren, getNodeBorther } from 'core/utils/DataHelper';
import styles from './Organization.less';
import tableStyle from 'core/style/Table.less';
import { connect } from 'dva';
import BizIcon from 'components/BizIcon';

const { Search } = { ...Input };

// 部门管理列表
@connect(({ loading }) => ({
  loading: loading.models.organization,
}))
export default class OrgList extends Component {
  // 加载组织列表
  componentDidMount() {
    this.props.dispatch({
      type: 'organization/listOrg',
    });
  }
  // 新增
  handleAdd = record => {
    const id = Object === typeof record ? record.parent : '';
    this.props.dispatch({
      type: 'organization/create',
      payload: {
        modalType: 'create',
        currentItem: {},
        parent: id,
      },
    });
  };
  // 编辑
  handleEdit = record => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    this.props.dispatch({
      type: 'organization/edit',
      payload: {
        modalType: 'edit',
        id: record.id,
      },
    });
  };
  // 启用/停用
  handleEnable = (record, e, status) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    this.props.dispatch({
      type: 'organization/changeStatus',
      payload: {
        id: record.id,
        status: status,
        record,
      },
    });
  };
  // 删除
  handleDelete = record => {
    const { dispatch, selectedRowKeys, data } = this.props;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (!!record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      dispatch({
        type: 'organization/delete',
        payload: {
          param: [record.id],
        },
        callback: () => {
          message.success('操作成功.');
        },
      });
    }
  };
  // 批量删除
  handleBatchDelete = () => {
    const { dispatch, selectedRowKeys, data } = this.props;
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      dispatch({
        type: 'organization/delete',
        payload: {
          param: selectedRowKeys,
        },
      });
    }
    // end if/else
  };
  // 搜索
  handleSearch = val => {
    const { dispatch } = this.props;
    dispatch({
      type: 'organization/listOrg',
      payload: val,
    });
  };
  // 行选
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'organization/updateState',
      payload: { selectedRowKeys: rows },
    });
  };

  //排序操作
  handleSort = (nodes, index, upOrDown) => {
    let orginOrders = nodes[index].orders;
    let targetID = 'up' === upOrDown ? nodes[index - 1].id : nodes[index + 1].id;
    let targetOrders = 'up' === upOrDown ? nodes[index - 1].orders : nodes[index + 1].orders;
    const switchObj = [
      {
        id: nodes[index].id,
        orders: targetOrders,
      },
      {
        id: targetID,
        orders: orginOrders,
      },
    ];
    this.props.dispatch({
      type: 'organization/sortOrg',
      payload: switchObj,
    });
  };
  render() {
    const { data, selectedRowKeys, loading } = this.props;

    const statusMap = { '0000': 'error', '0001': 'success' };
    const status = { '0000': '已停用', '0001': '正常' };

    const column = [
      {
        title: '单位/部门名称',
        dataIndex: 'name',
      },
      {
        title: '所属单位/部门',
        dataIndex: 'parentname',
      },
      {
        title: '排序',
        dataIndex: 'orders',
        render: (text, record) => {
          const brother = getNodeBorther(this.props.data, record.parentid);
          const size = brother.length;
          const index = brother.indexOf(record);
          return (
            <div>
              {text}
              <Divider type="vertical" />
              {0 !== size && index !== size - 1 ? (
                <BizIcon
                  onClick={e => this.handleSort(brother, index, 'down')}
                  type="descending"
                  style={{ color: '#098FFF', cursor: 'pointer' }}
                />
              ) : (
                <BizIcon type="descending" />
              )}
              {0 !== size && index !== 0 ? (
                <BizIcon
                  onClick={e => this.handleSort(brother, index, 'up')}
                  style={{ color: '#098FFF', cursor: 'pointer' }}
                  type="ascending"
                />
              ) : (
                <BizIcon type="ascending" />
              )}
            </div>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: text => {
          return <Badge status={statusMap[text]} text={status[text]} />;
        },
      },
      {
        title: '操作',
        render: (text, record) => (
          <div>
            <a onClick={e => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={e => this.handleAdd(record)}>添加下级</a>
          </div>
        ),
      },
      {
        title: '是否启用',
        width: 150,
        render: (text, record) => (
          <div>
            {record.status === '0000' ? (
              <a onClick={e => this.handleEnable(record, e, '0001')}>启用</a>
            ) : (
              <a onClick={e => this.handleEnable(record, e, '0000')}>停用</a>
            )}
            <Divider type="vertical" />
            <a onClick={e => this.handleDelete(record, e)}>删除</a>
          </div>
        ),
      },
    ];

    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <Card bordered={false}>
        <Row gutter={24} type="flex" justify="space-between" className={tableStyle.tableActionBtn}>
          <Col xl={6} lg={6} md={6} sm={6} xs={6}>
            <div>
              <Button icon="plus" type="primary" onClick={() => this.handleAdd('')}>
                新增
              </Button>
              {selectedRowKeys.length > 0 && (
                <span>
                  <Popconfirm
                    title="确定要删除选中的条目吗?"
                    placement="top"
                    onConfirm={() => this.handleBatchDelete()}
                  >
                    <Button>删除菜单</Button>
                  </Popconfirm>
                </span>
              )}
            </div>
          </Col>
          <Col xl={6} lg={6} md={6} sm={6} xs={6} offset={12}>
            <Search
              placeholder="输入组织名称以搜索"
              onSearch={value => this.handleSearch(value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
        {/* 已选提示 */}
        <Alert
          className={tableStyle.tableAlert}
          message={
            <div>
              已选择 已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
              项&nbsp;&nbsp;
              <a style={{ marginLeft: 24 }} onClick={() => this.handleSelectRows([])}>
                清空选择
              </a>
            </div>
          }
          type="info"
          showIcon
        />
        {/* 列表 */}
        <Table
          columns={column}
          dataSource={data}
          loading={loading}
          rowClassName={record => {
            return record.status === '0000' ? styles.disabled : styles.enabled;
          }}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </Card>
    );
  }
}