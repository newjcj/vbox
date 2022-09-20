import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import "../css/indexContent/top.scss"
const { remote, ipcRenderer } = window.require('electron')



const Top = ({ rows }) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [req, setReq] = useState({ pageNo: 0, pageSize: 10 })
  const [value, setValue] = useState('')
  let node = useRef(null)
  const miniWindow = () => {
    remote.getCurrentWindow().minimize()
    //ipcRenderer.send("w-min")
  }
  const closeWindow = () => {
    remote.getCurrentWindow().close()
    //ipcRenderer.send("w-min")
  }

  return (
    <div class=" Top">
      <div class="wrapper">
        <div id="logo">
          <img src="images/logo.png" />

        </div>
        <div id="write">
        </div>
        <div id="handle">
          <div class="top-mini" onClick={() => { miniWindow() }}>
            —
          </div>
          <div class="delete" onClick={() => { miniWindow() }}>
            x
          </div>
        </div>

      </div>
    </div>
  )
}

Top.propTypes = {
  rows: PropTypes.array,
}

export default Top