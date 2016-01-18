import devcard from 'devcard';
import Button from '../components/Button.jsx';

devcard.ns('Button');

const KINDS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger'
];

devcard(
  'Buttons',
  <div>
    {KINDS.map(kind => <Button key={kind} kind={kind} />)}
  </div>
);
