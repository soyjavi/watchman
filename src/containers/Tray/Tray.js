import { remote } from 'electron';
import React from 'react';

import { C, formatTime, hideMenu, showMenu, sound } from '../../common';
import { Consumer } from '../../context';

let ticks = 0;
const MAX_UNSYNCED_TICKS = 10;

const { SOUND } = C;

const setTitle = ({ title = '', deadline, timelapsed } = {}) => {
  const { mainWindow, tray } = remote.getGlobal('shared');
  let value = '';
  let time;

  if (deadline && timelapsed) {
    time = timelapsed + ticks;
    value = ` ${title} ${time <= deadline ? formatTime(deadline - time) : ''}`;

    if (time > deadline && !mainWindow.isVisible()) {
      sound(SOUND.TINK);
      mainWindow.show();
    }
  }

  tray.setTitle(value);
};

class Tray extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      onTaskUpdate: undefined,
      task: undefined,
    };

    // -- Events
    const { mainWindow, tray } = remote.getGlobal('shared');

    tray.on('click', () => {
      if (mainWindow.isVisible()) hideMenu();
      else showMenu();
    });

    remote.app.on('browser-window-blur', () => {
      if (mainWindow.isVisible()) hideMenu();
    });

    setInterval(() => {
      const { state: { onTaskUpdate, task } } = this;

      if (task) {
        ticks += 1;
        setTitle(task);
        if (mainWindow.isVisible()) showMenu();

        if (ticks >= MAX_UNSYNCED_TICKS) {
          const timelapsed = task.timelapsed + ticks;
          const updatedTask = { ...task, timelapsed };
          ticks = 0;
          this.setState({ task: updatedTask });
          onTaskUpdate(updatedTask);
        }
      }
    }, 1000);
  }

  _changeTitle = ({ active, onTaskUpdate, tasks }) => {
    const { state = {} } = this;
    const { task: { id: previousId } = {} } = state;
    const task = tasks.find(({ id }) => id === active);

    if (!state.onTaskUpdate) this.setState({ onTaskUpdate });
    this.setState({ task });
    if (!task || active !== previousId) {
      ticks = 0;
      setTitle(task);
    }
  }

  render() {
    return (
      <Consumer>
        { this._changeTitle }
      </Consumer>
    );
  }
}

export default Tray;
