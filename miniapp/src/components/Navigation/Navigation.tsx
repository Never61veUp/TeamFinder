import { NavLink } from 'react-router-dom';
import './Navigation.css';

export const Navigation = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🏠</span>
                <span className="nav-label">Главная</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">👤</span>
                <span className="nav-label">Профиль</span>
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🔍</span>
                <span className="nav-label">Поиск</span>
            </NavLink>
            <NavLink to="/create" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">➕</span>
                <span className="nav-label">Создать</span>
            </NavLink>
        </nav>
    );
};