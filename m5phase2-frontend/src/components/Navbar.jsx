import { useState, useEffect } from 'react';
import './Navbar.css';
import zLogo from '../assets/Z_Energy_logo.png';
import SearchIcon from '../assets/Search.png';
import SearchIconInverted from '../assets/Search-inverted.png';
import loginButtonImage from '../assets/login_button.png';
import DarkModeToggle from './ui/dark-mode-toggle';

function Navbar() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
      // Add/remove dark class for Tailwind
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const searchIcon = isDarkMode ? SearchIconInverted : SearchIcon;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Tab Switcher */}
        <div className="navbar-left">
          <img src={zLogo} alt="Z Energy" className="navbar-logo" />

          <div className="tab-switcher">
            <button
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              For personal
            </button>
            <button
              className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              For business
            </button>
          </div>
        </div>

        {/* Right Side Navigation */}
        <div className="navbar-right">
          <button className="nav-link">Download Z App</button>
          <button className="nav-link">About Z</button>

          {/* Search Icon */}
          <button className="icon-button" aria-label="Search">
            <img src={searchIcon} alt="Search" className="navbar-icon-img" />
          </button>

          {/* Dark Mode Toggle */}
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

          {/* Login Button - Simple Image */}
          <button className="login-button-image" aria-label="Login">
            <img src={loginButtonImage} alt="Login" />
          </button>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="navbar-secondary">
        <div className="navbar-container">
          <div className="nav-menu">
            <button className="nav-menu-item">
              At the station
              <span className="icon-chevron-down"></span>
            </button>
            <button className="nav-menu-item">
              Rewards and Promotions
              <span className="icon-chevron-down"></span>
            </button>
            <button className="nav-menu-item">
              Z App
              <span className="icon-chevron-down"></span>
            </button>
            <button className="nav-menu-item">Locations</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
