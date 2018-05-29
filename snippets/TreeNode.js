import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';

import { checkHierarchyNodesSelection } from 'screens/Message/actions';
import { getHierarchyChildren, toggleNode } from 'reference/actions';
import { getRequestsCount } from 'UI/reducer';

import { toJS } from 'lib/utils/to-js';

export class TreeNode extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleCheckboxToggle = this.handleCheckboxToggle.bind(this);
    this.handleHierarchyNodesSelection = this.handleHierarchyNodesSelection.bind(this);
    this.updateChildrenIfNeeded = this.updateChildrenIfNeeded.bind(this);
  }

  toggle () {
    const { toggleNode, data, pmSubscriptionId, getHierarchyChildren, policyId } = this.props;
    data.hasOwnProperty('path') && toggleNode(pmSubscriptionId, data.path);
    if (data.hasOwnProperty('children') && data.children.length === 0) {
      (!policyId)
        ? getHierarchyChildren(pmSubscriptionId, data)
        : getHierarchyChildren(pmSubscriptionId, data, policyId)
    }
  }

  handleHierarchyNodesSelection (pmId, node) {
    const { checkHierarchyNodesSelection } = this.props;
    checkHierarchyNodesSelection(pmId, node);
  }

  updateChildrenIfNeeded (children = [], callback) {
    const { pmSubscriptionId } = this.props;
    children.forEach(c => {
      if (c.children) {
        callback(pmSubscriptionId, c);
        this.updateChildrenIfNeeded(c.children, callback);
      }
    })
  }

  handleCheckboxToggle () {
    const { data, pmSubscriptionId } = this.props;
    this.handleHierarchyNodesSelection(pmSubscriptionId, data);
    if (data.children.length > 0) {
      this.updateChildrenIfNeeded(data.children, this.handleHierarchyNodesSelection);
    }
  }

  renderChild (data) {
    const { pmSubscriptionId, policyId } = this.props;
    return (
      <ConnectedTreeNode
        key={data.displayName}
        data={data}
        pmSubscriptionId={pmSubscriptionId}
        policyId={policyId}
      />
    )
  }

  divStyle () {
    const { data } = this.props;
    const indent = data.hasOwnProperty('path') ? data.path.length : 0;
    return {
      marginLeft: (indent * 20) + 'px',
    }
  }

  render () {
    const { data, isLoading, isSelected } = this.props;
    const disabled = data['hierarchyDefinitionId'];
    const collapsed = !data.expanded;
    return (
      <div style={this.divStyle()}>
        {
          disabled
            ? null
            : data.hasOwnProperty('childrenCount') && data.childrenCount === 0
            ? null
            : <button
                className='expand-node'
                disabled={disabled || isLoading}
                onClick={this.toggle}
            >
              {icon}
            </button>
        }
        {
          disabled
            ? null
            : <div className='checkbox-container'>
              <Checkbox
                key={data.displayName || 'one'}
                onChange={this.handleCheckboxToggle}
                checked={isSelected}>
                {
                  (!data.hasOwnProperty('displayName') || data.displayName === null)
                    ? 'No name provided'
                    : data.displayName
                }
                {isLoading && <i className=' m-l-sm pm-icons pm-icons-Loader pm-spin pm-icons-m' />}
              </Checkbox>
            </div>
        }
        {
          (data.hasOwnProperty('expanded') && data.expanded)
            ? data.children.map(node => this.renderChild(node))
            : null
        }
      </div>
    )
    const icon = collapsed ? '+' : '-';
  }
}

TreeNode.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  getHierarchyChildren: PropTypes.func.isRequired,
  toggleNode: PropTypes.func.isRequired,
  pmSubscriptionId: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  checkHierarchyNodesSelection: PropTypes.func.isRequired,
  policyId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ])
};

const mapStateToProps = (state, ownProps) => ({
  isLoading: ownProps.data.hasOwnProperty('detailIds')
      ? getRequestsCount(state, ownProps.data.detailIds.join()) > 0
      : getRequestsCount(state, `getHierarchyRootChildren-${ownProps.pmSubscriptionId}`) > 0,
  isSelected: ownProps.data.hasOwnProperty('isSelected') && ownProps.data.isSelected
})

const ConnectedTreeNode = connect(
  mapStateToProps,
  {
    getHierarchyChildren,
    toggleNode,
    checkHierarchyNodesSelection
  }
  )(toJS(TreeNode));

export default ConnectedTreeNode;

