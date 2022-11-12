import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { query } from './utils/mysql'
import useNotice from '../hooks/useNotice'
import useGetData from '../hooks/useGetData'
import Top from './indexContent/Top'
import One from './indexContent/One'
import Two from './indexContent/Two'
import Three from './indexContent/Three'
import Four from './indexContent/Four'
import { getParentNode } from '../utils/helper'
import "./css/JcjIndex.scss"
const Store = window.require('electron-store')
const { shell, app } = window.require('electron')
const userStore = new Store({ name: 'userStore' })
const dbStore = new Store({ name: 'dbStore' })
const mysql = require('mysql')
var baseUrl = "https://api-vbox.jpqapro.com"


//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const saveDb = (data) => {

  const user = userStore.get('user')
  let url = baseUrl + ''
  axios({
    url,
    data: data,
    method: 'POST',
    responseType: 'stream',
    headers: { 'Session-Id': user.token }
  }).then(response => {
    console.log(response)

    if (response.data.resultCode != "00000") {
      message.info(response.data.returnMsg)
    } else {
      console.log('提交数据成功')
    }

  }).catch(err => {
    message.info(err.message)
  })
}

let sql1 = `select a.PrecioDetalle price,a.ArticuloID skuNo,a.NombreES title,s.Stock stockCount,s.Stock sss from articulo a left join stock s on a.ArticuloID=s.ArticuloID`
query(sql1, function (err, vals, fields) {
  let mdata = JSON.parse(JSON.stringify(vals));
  let dbData = dbStore.get('data')
  let time = new Date().getTime()
  if (dbData == undefined || dbData.time == undefined || dbData.data == undefined) {
    // 初始化数据
    let data = { data: mdata, time: new Date().getTime() }
    dbStore.set('data', data)
  } else {
    mdata.forEach(item => {
      item.isDelete = 1
      dbData.data.forEach(db => {
        if (item.skuNo == db.skuNo) {
          item.isDelete = 0
        }
      })
    })
  }
  console.log('mysql---', a)
});








//const navigate=useNavigate();
//navigate("/test");
const Index = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [req, setReq] = useState({ pageNo: 0, pageSize: 10 })
  const [value, setValue] = useState('')
  const [canscroll, setCanscroll] = useState(true)
  const [top, setTop] = useState(0)
  const notice1 = useNotice('aa')
  let node = useRef(null)
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const closeSearch = (editItem) => {
    setEditStatus(false)
    setValue('')
    // if we are editing a newly created file, we should delete this file when pressing esc
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  const { rows: rows, fun: fun } = useGetData(setReq, req, active, canscroll, setCanscroll)
  const showTop = () => {
    setTop(top == 1 ? 0 : 1)
  }
  const selectItem = (index) => {
    console.log("aaaa----", index)
    setActive(index)
  }
  const openUrl = (index) => {

    const user = userStore.get('user')
    let url = baseUrl + "/api/merchant/shop/query/price/url"
    axios({
      url,
      data: { ...req },
      method: 'POST',
      responseType: 'stream',
      headers: { 'Session-Id': user.token }
    }).then(response => {
      console.log(response)

      if (response.data.resultCode != "00000") {
        message.info(response.data.returnMsg)
      } else {
        response.data.data.time = new Date().getTime()
        shell.openExternal(response.data.data.url)
      }

    }).catch(err => {
      message.info(err.message)
    })
  }
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          const { id, title } = parentElement.dataset
          setEditStatus(id)
          setValue(title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    },
  ], '.file-list', [files])

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (enterPressed && editStatus && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew)
      setEditStatus(false)
      setValue('')
    }
    if (escPressed && editStatus) {
      closeSearch(editItem)
    }
  })
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
  useEffect(() => {
    console.log("top------")
    console.log(top)
  }, [top])
  useEffect(() => {
    console.log("rowss------", rows)
  }, [rows])
  useEffect(() => {
  }, [active])
  return (
    <div class="main1">
      <Top rows={rows} />
      <div class="row content-index">
        <div class="col-md-12 navigate-index">
          <div class="row-top">
            <div class="nav text">应用工具</div>

            <div class="nav actionsico">
              <div className={`${top}` == true ? 'arrow top' : 'arrow bottom'} onClick={() => { setTop(top == 1 ? 0 : 1) }}></div>
            </div>
          </div>
          <div className={`${top}` == true ? "show no" : "show"}>
            <div className={`${top}` == true ? "row-nav d-flex flex-row bd-highlight" : "row-nav d-flex flex-row bd-highlight show"}>
              <div class="item">
                <div class="wrap-jcj" onClick={() => { openUrl(1) }}>
                  <div class="image">
                    <img src="images/1.png" />
                  </div>
                  <div class="text">扫码查价</div>
                </div>
              </div>
              <div class="item">
                <div class="wrap-jcj" onClick={() => { openUrl("http://www.qq.com") }}>
                  <div class="image">
                    <img src="images/2.png" />
                  </div>
                  <div class="text">线上店铺</div>
                </div>
              </div>
              <div class="item">
                <div class="wrap-jcj" onClick={() => { openUrl("http://www.qq.com") }}>
                  <div class="image">
                    <img src="images/3.png" />
                  </div>
                  <div class="text">更多服务</div>
                </div>
              </div>
              <div class="item">
                <div class="wrap-jcj" onClick={() => { openUrl("http://www.qq.com") }}>
                  <div class="image">
                    <img src="images/4.png" />
                  </div>
                  <div class="text">系统设置</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row-nav d-flex flex-row bd-highlight check">
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(1) }}>价格提醒</div>
                <div className={`${active}` == 1 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(2) }} >特价商品</div>
                <div className={`${active}` == 2 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(3) }} >订单通知</div>
                <div className={`${active}` == 3 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(4) }} >其它</div>
                <div className={`${active}` == 4 ? 'line active' : 'line'}></div>
              </div>
            </div>
          </div>
          <div>
            {active == 1 && <One rows={rows} fun={fun} req={req} setReq={setReq} canscroll={canscroll} setCanscroll={setCanscroll} />}
            {active == 2 && <Two rows={rows} fun={fun} req={req} setReq={setReq} canscroll={canscroll} setCanscroll={setCanscroll} />}
            {active == 3 && <Three rows={rows} fun={fun} req={req} setReq={setReq} canscroll={canscroll} setCanscroll={setCanscroll} />}
            {active == 4 && <Four rows={rows} fun={fun} req={req} setReq={setReq} canscroll={canscroll} setCanscroll={setCanscroll} />}
          </div>
        </div>
      </div>
    </div>
  )
}

Index.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
}

export default Index