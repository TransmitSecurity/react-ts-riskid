import { useTSAccountProtection } from '@transmitsecurity/riskid-reactjs-ts';

function InnerComponent() {
  const { triggerActionEvent, setAuthenticatedUser, clearUser } = useTSAccountProtection();

  return (
    <>
      <button
        style={{width: '100px', height: '100px' }}
        onClick={async () => {
          const actionResponse = await triggerActionEvent('login');
          const actionToken = actionResponse?.actionToken;
          // Add code here to send the action and the received actionToken to your backend
        }}
      >Login</button>
      <button
        style={{width: '100px', height: '100px' }}
        onClick={() => setAuthenticatedUser('[USER_ID]')}
      >Set</button>
      <button
        style={{width: '100px', height: '100px' }}
        onClick={() => clearUser()}
      >Reset</button>
    </>
  );
};

export default InnerComponent;
