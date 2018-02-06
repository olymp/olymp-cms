import React, { Component } from 'react';
import { createComponent } from 'react-fela';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Logo from './logo';

const animationIterationCount = 'infinite';
const duration = 1500;
const withAnimation = (prop = 'animate') => Wrapped =>
  class InnerLoad extends Component {
    state = { iteration: 0 };
    componentWillReceiveProps(newProps) {
      if (this.props[prop] === newProps[prop]) {
        return;
      }
      if (newProps[prop] && !this.timeout) {
        this.timeout = setTimeout(this.restart, duration);
      }
    }
    componentWillUnmount() {
      this.unmounted = true;
    }
    restart = () => {
      if (this.unmounted) {
        return;
      }
      this.setState({ iteration: this.state.iteration + 1 });
      this.timeout = null;
      if (this.props[prop] && !this.timeout) {
        this.timeout = setTimeout(this.restart, duration);
      }
    };
    render() {
      return <Wrapped key={this.state.iteration} {...this.props} />;
    }
  };

const enhanceLoader = compose(
  connect(({ apollo }, { loading }) => ({
    loading: loading || (apollo && apollo.loading)
  })),
  withAnimation('loading')
);

export default enhanceLoader(
  createComponent(
    () => ({
      /* transition: `scale ${duration}ms`,
      onHover: {
        animationDuration: `${duration}ms`,
        animationIterationCount: 1,
        animationTimingFunction: 'ease',
        animationName: {
          from: {
            transform: 'rotate(0deg)'
          },
          to: {
            transform: 'scale(0.7) rotate(135deg)'
          }
        }
      } */
      overflow: 'visible',
      animationDuration: `${duration}ms`,
      animationIterationCount,
      animationTimingFunction: 'ease',
      animationName: {
        '0%': {
          transform: 'scale(1.00) rotate(0)'
        },
        '50%': {
          transform: 'scale(0.75) rotate(180deg)'
        },
        '100%': {
          transform: 'scale(1.00) rotate(360deg)'
        }
      }
    }),
    props => <Logo {...props} />,
    ({ loading, ...p }) => Object.keys(p)
  )
);
