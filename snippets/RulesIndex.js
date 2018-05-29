import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, ListGroupItem } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';

import { updateRule, removeRule } from 'screens/Message/actions';
import { validateMessage } from 'UI/actions';
import * as renderComponents from './components';
import RenderOperator from './RenderOperator';
import RenderTransactionLevel from './RenderTransactionLevel';
import { rulesSelector } from 'screens/Message/rulesSelector';
import { getMessageProp } from 'screens/Message/reducer';
import { getUIProp } from 'UI/reducer';

import { toJS } from 'lib/utils/to-js';

export class RuleInstance extends Component {
  componentDidMount () {
    const { validateMessage } = this.props;
    validateMessage('instances');
  }

  // TODO: deprecated. Check "getDerivedStateFromProps"
  componentWillReceiveProps (nextProps) {
    const {
      policyScheduleType,
      validateMessage,
      validationErrors,
      instance,
      removeRule
    } = this.props;

    if (policyScheduleType !== nextProps.policyScheduleType) {
      validateMessage('instances');
    }

    if (validationErrors !== nextProps.validationErrors) {
      if (nextProps.validationErrors.instances) {
        if (includes(nextProps.validationErrors.instances.notValid, instance.rule)) {
          removeRule(instance.rule);
        }
      }
    }
  }

  renderRule () {
    const { instance, updateRule, removeRule, rules } = this.props;
    if (isEmpty(rules)) return null;

    const activeRule = rules[instance.rule];
    const INSTANCE_RENDERER = renderComponents[`RuleInstance${activeRule.renderType}`] ||
      renderComponents['RuleInstanceDefault'];

    if (activeRule.renderType === 'Static') {
      const addMarginClass = (activeRule.operators.length > 1) ? 'm-r-xs' : '';
      return (
        <ListGroupItem className='rule-instance-item item-static'>
          <Row>
            <Col sm={22} className='display-t'>
              <div className='display-t-c valign-m p-l-xl' style={{height: '45px'}}>
                <div className={`display-i-b ${addMarginClass}`}>
                  <RenderOperator
                    rule={activeRule}
                    instance={instance}
                  />
                </div>{' '}
                <div className='display-i-b'>
                  {activeRule.name}
                </div>
                <INSTANCE_RENDERER
                  instance={instance}
                  rule={activeRule}
                  updateItems={items => updateRule(activeRule, {items})}
                />
              </div>
            </Col>
            <Col sm={2} className='talign-r'>
              <button
                className='cwt-btn-remove-row'
                onClick={() => { removeRule(activeRule.id) }}
              >
                <i className='pm-icons pm-icons-Close pm-icons-m' />
              </button>
            </Col>
          </Row>
        </ListGroupItem>
      );
    }

    return (
      <ListGroupItem className='rule-instance-item'>
        <Row>
          <Col md={9} className='talign-r display-t'>
            <div
              className='display-t-c valign-m'
              style={{height: '45px'}}>
              {activeRule.name}
            </div>
          </Col>
          <Col md={5} className='display-t'>
            <div
              className='display-t-c valign-m'
              style={{height: '45px'}}>
              <RenderOperator
                rule={activeRule}
                instance={instance}
              />
            </div>
          </Col>
          <Col md={8}>
            <INSTANCE_RENDERER
              instance={instance}
              rule={activeRule}
              updateItems={items => updateRule(activeRule.id, {items})}
            />
          </Col>
          <Col md={2} className='talign-r'>
            <button
              className='cwt-btn-remove-row'
              onClick={() => { removeRule(activeRule.id) }}
            >
              <i className='pm-icons pm-icons-Close pm-icons-m' />
            </button>
          </Col>
        </Row>
        <RenderTransactionLevel
          rule={activeRule}
          instance={instance}
        />
      </ListGroupItem>
    );
  }

  render () {
    return this.renderRule();
  }
}

RuleInstance.propTypes = {
  instance: PropTypes.object.isRequired,
  rules: PropTypes.object.isRequired,
  updateRule: PropTypes.func.isRequired,
  removeRule: PropTypes.func.isRequired,
  validateMessage: PropTypes.func.isRequired,
  policyScheduleType: PropTypes.number.isRequired,
  validationErrors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  rules: rulesSelector(state),
  instances: getMessageProp(state, 'instances'),
  policyScheduleType: getMessageProp(state, 'policyScheduleType'),
  validationErrors: getUIProp(state, 'messageValidationErrors')
});

export default connect(
  mapStateToProps,
  { updateRule, removeRule, validateMessage })(toJS(RuleInstance));
