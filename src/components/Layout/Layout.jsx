import Header from '../Header/Header';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.appLayout}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
      <footer className={styles.footer}>
        <p>© 2026 Завод лампочек. Все макеты являются прототипом.</p>
      </footer>
    </div>
  );
};

export default Layout;