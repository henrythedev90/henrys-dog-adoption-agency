import Image from "next/image";
import styles from "./page.module.css";
import AuthPage from "./auth/page";

export default function Home() {
  return (
    <div className={styles.page}>
      <AuthPage />
    </div>
  );
}
