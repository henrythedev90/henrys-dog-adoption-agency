import Image from "next/image";
import styles from "./page.module.css";
import Auth from "./auth/page";

export default function Page() {
  return (
    <div className={styles.page}>
      <Auth />
    </div>
  );
}
