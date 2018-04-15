import { bool } from 'prop-types';
import React, { PureComponent } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

import { formatTime, toggleMenu } from '../../common';
import { Consumer } from '../../context';
import styles from './Input.style';

const regexp = /(\d+)(m|h)/;

class Input extends PureComponent {
  state = {
    deadline: undefined,
    title: undefined,
  }

  componentWillReceiveProps({ focus = this.props.focus }) {
    if (this.el && focus) this.el.focus();
  }

  _onChange = (input) => {
    let title = input;
    let deadline = (regexp.exec(title) || [])[0];

    if (deadline) {
      title = title.replace(deadline, '');
      const inHours = deadline.includes('h');
      deadline = parseInt(deadline.split(inHours ? 'h' : 'm')[0], 10) * (inHours ? 3600 : 60);
    }

    this.setState({
      deadline: deadline || this.state.deadline,
      title,
    });
  }

  _onBlur = (onTaskAdd) => {
    const { el, state: { deadline, title } } = this;

    if (deadline && title) {
      onTaskAdd({ deadline, title });
      this.setState({ deadline: undefined, title: undefined });
      el.clear();
      el.focus();
    }
  }

  render() {
    const {
      _onBlur, _onChange, state: { deadline, title },
    } = this;

    return (
      <Consumer>
        { ({ onTaskAdd }) => (
          <View style={styles.container}>
            <TextInput
              ref={(el) => {
                this.el = el;
              }}
              autoCorrect={false}
              autoCapitalize="none"
              blurOnSubmit
              onBlur={() => _onBlur(onTaskAdd)}
              onChangeText={_onChange}
              placeholder="Type a todo..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={StyleSheet.flatten([styles.text, styles.input])}
              underlineColorAndroid="transparent"
              value={title}
            />
            { deadline &&
              <Text style={StyleSheet.flatten([styles.text, styles.deadline])}>{formatTime(deadline)}</Text> }
          </View>
          )}
      </Consumer>

    );
  }
}

Input.propTypes = {
  focus: bool,
};

Input.defaultProps = {
  focus: false,
};

export default Input;