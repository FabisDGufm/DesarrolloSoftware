import styles from './Home.module.css'

export function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>El Pasillo</h1>
      <p className={styles.subtitle}>Red social universitaria de Guatemala</p>
    </div>
  )
}
