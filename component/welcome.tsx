import { NextPage } from "next";
import styles from '../styles/Home.module.css'

const Welcome: NextPage = () => {
  return (
    <h1 className={styles.title}>
      Welcome to <a href="https://nextjs.org">Shitty Stuff!</a>
    </h1>
  )
}

export default Welcome