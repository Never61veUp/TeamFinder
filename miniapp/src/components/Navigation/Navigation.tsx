import { NavLink } from 'react-router-dom';
import { Home, User, Users, CirclePlus } from 'lucide-react'; // Импортируем иконки
import './Navigation.css';

export const Navigation = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Home size={24} strokeWidth={1.5} />
                <span className="nav-label">Главная</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <User size={24} strokeWidth={1.5} />
                <span className="nav-label">Профиль</span>
            </NavLink>

            {/* На скриншоте для Поиска иконка Users, но если нужен лупа — используйте Search */}
            <NavLink to="/search" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Users size={24} strokeWidth={1.5} />
                <span className="nav-label">Поиск</span>
            </NavLink>

            <NavLink to="/create" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <CirclePlus size={24} strokeWidth={1.5} />
                <span className="nav-label">Создать</span>
            </NavLink>
        </nav>
    );
};