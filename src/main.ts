import './styles.css';
import { createAppStateMachine } from './app/stateMachine';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Root element #app is not found.');
}

createAppStateMachine(root).start();
