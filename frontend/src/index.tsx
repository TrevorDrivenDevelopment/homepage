/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import './index.css';
import App from './App';
import HomePage from './pages/HomePage';
import PersonalApplications from './apps/PersonalApplications';
import QuestionSelector from './apps/personality-test/QuestionSelector';
import LiveOptionsCalculator from './apps/options-calculator/LiveOptionsCalculator';

const root = document.getElementById('root');

if (!root) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Router root={App}>
    <Route path="/" component={HomePage} />
    <Route path="/applications" component={PersonalApplications} />
    <Route path="/personality-test" component={QuestionSelector} />
    <Route path="/options-calculator" component={LiveOptionsCalculator} />
  </Router>
), root);
