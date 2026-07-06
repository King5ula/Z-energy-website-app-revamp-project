import '../styles/Breadcrumb.css';

function Breadcrumb({ path, onNavigate }) {
  return (
    <div className="breadcrumb">
      {path.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator"> / </span>}
          <button
            className="breadcrumb-link"
            onClick={() => onNavigate(index)}
          >
            {item}
          </button>
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;
