import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { HelpBlock } from 'react-bootstrap';

import { getUIProp } from 'UI/reducer';
import { validateMessage } from 'UI/actions';
import { setText } from 'screens/Message/actions';
import TranslationSvc from 'translation/TranslationSvc';
import { getMessageProp } from 'screens/Message/reducer';

import { toJS } from 'lib/utils/to-js';

export default function withValidation (fieldName) {
  return function createWithValidation (WrappedComponent) {
    class WithValidation extends Component {
      constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.state = {
          isFocus: false,
          touched: false,
          fieldValue: ''
        };
      }

      componentDidMount () {
        const { validateMessage } = this.props;
        validateMessage(fieldName);
      }

      // TODO: deprecated. Check "getDerivedStateFromProps"
      componentWillReceiveProps (nextProps) {
        const { stateValue, validateMessage } = this.props;
        if (stateValue !== nextProps.stateValue) {
          validateMessage(fieldName);
        }
      }

      renderError () {
        const { validationError } = this.props;
        const { isFocus, touched } = this.state;
        if (typeof validationError === 'object' && !isFocus && touched) {
          return (
            <HelpBlock className='form-error-notification'>
              {TranslationSvc.getTranslationFormat(validationError.message,
                {item: validationError.item})}
            </HelpBlock>
          );
        } else {
          return null;
        }
      }

      getValidationState () {
        const { validationError } = this.props;
        const { isFocus, touched } = this.state;
        return (typeof validationError === 'object' && !isFocus && touched)
          ? 'error'
          : null
      }

      handleChange (value) {
        const { setText } = this.props;
        setText(fieldName, value);
      }

      handleFocus () {
        this.setState((prevState, props) => ({isFocus: !prevState.isFocus, touched: true}));
      }

      handleBlur () {
        this.setState((prevState, props) => ({isFocus: !prevState.isFocus}));
      }

      render () {
        const { stateValue } = this.props;
        return <WrappedComponent
          error={this.renderError()}
          validationState={this.getValidationState()}
          handleChange={this.handleChange}
          handleFocus={this.handleFocus}
          handleBlur={this.handleBlur}
          isFocus={this.state.isFocus}
          isTouched={this.state.touched}
          displayValue={stateValue}
          {...this.props}
        />;
      }
    }

    WithValidation.defaultProps = {
      stateValue: ''
    };

    WithValidation.propTypes = {
      validationError: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
      ]),
      stateValue: PropTypes.string.isRequired,
      validateMessage: PropTypes.func.isRequired,
      setText: PropTypes.func.isRequired
    };

    const mapStateToProps = (state) => {
      return {
        stateValue: getMessageProp(state, fieldName),
        validationError:
          getUIProp(state, 'messageValidationErrors').has(fieldName) &&
          getUIProp(state, 'messageValidationErrors').get(fieldName)
      };
    };

    return connect(mapStateToProps, { validateMessage, setText })(toJS(WithValidation));
  }
}
