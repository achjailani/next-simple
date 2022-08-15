import { NextPage } from "next";
import styles from '../styles/Home.module.css'

const PdfViewer: NextPage = () => {
  return (
    <h1 className={styles.title}>
      Welcome to <a href="https://nextjs.org">Shitty Pdf!</a>
    </h1>
  )
}

export default PdfViewer