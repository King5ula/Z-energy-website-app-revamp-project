import '../styles/ConsentModal.css';

function ConsentModal({ onAllow, onDeny }) {
  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        <h2>Find Z stations near you?</h2>
        <p>We'd like to use your location to show you the nearest Z Energy stations.</p>
        <div className="consent-modal-actions">
          <button className="btn-primary" onClick={onAllow}>
            Allow
          </button>
          <button className="btn-secondary" onClick={onDeny}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;
