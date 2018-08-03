/* global weui */

import React, { Component } from 'react'
import menus from './QuickNavMenus'
import './QuickNav.styl'
import ajax from '../../../lib/ajax'
import getDataService from '../../../lib/getDataService';


class QuickNav extends Component {


    constructor(props) {
        super(props)
        this.state = {
            Status: false,
            moveY: '',
            T: '',
            starY: '',
            starYEnd: '',
            disY: '',
            menusAll: menus,
            cardID: '',
            renewID: ''
        }
        this.flags = false
        this.allMenus = []
        this.allMenusID = []
        this.getMenus = this.getMenus.bind(this)
        this.Drag = this.Drag.bind(this)
        this.DragStart = this.DragStart.bind(this)
    }

    componentDidMount() { //
        this.init()
        this.wrapper.addEventListener('touchmove', function(e) {
            e.preventDefault()
        })
        this.shadowShow.addEventListener('touchmove', function(e) {
            e.preventDefault()
        })
    }

    componentWillUnmount () {
        this.wrapper.removeEventListener('touchmove', function(e) {
            e.preventDefault()
        })
        this.shadowShow.removeEventListener('touchmove', function(e) {
            e.preventDefault()
        })
    }

    init() {
        this.getMenus()
        if (sessionStorage.getItem('POSITION')) {
            this.wrapper.style.top = sessionStorage.getItem('POSITION')
        }
    }

    getMenus() {
        const _this = this
        getDataService({
            url: '/authorization/menu/getall.do',
        }).then(info => {
            let res = info.data.menu
            res.map(item => {
                item.children.map( item => {
                    _this.allMenus.push(item.name)
                    _this.allMenusID.push(item)
                })
            })
            this.removeMenus(_this.allMenus)
        })
    }

    removeMenus(nav) {
        if (!this.isInmenu('快捷开单',nav)) {
            menus.map((itme, index) => {
                if (itme.name == '快捷开单') {
                    menus.splice(index,1)
                }
            })
        }

        if (!(this.isInmenu('会员办卡',nav) || this.isInmenu('会员续费',nav))) {
            menus.map((itme, index) => {
                if (itme.name == '办卡/续费') {
                    menus.splice(index,1)
                }
            })
        }
        this.setState({
            menusAll: menus
        })
    }

    isInmenu(val,arr) {

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                return true
            }
        }
        return false
    }

    changeStatus() {
        const foo = this.state.Status
        this.setState({
            Status: !foo
        })
    }

    Loginout(e) {
        // sessionStorage.removeItem('CARD')
        if (e.target.getAttribute('data-id') == '注销') {
            const myConfirm = weui.confirm('确定要退出登录吗？', {
                className: 'crm-weui-component',
                isAndroid: false,
                buttons: [
                {
                    label: '退出',
                    type: 'primary',
                    onClick: () => {
                    myConfirm.hide()

                    ajax({ url: '/authentication/account/logout.do' }).then(() => location.href = './login')

                    return false
                    }
                },
                {
                    label: '取消',
                    type: 'default'
                }
                ]
            })
        }

        if (e.target.getAttribute('data-id') == '办卡/续费') {
            if (this.allMenusID) {
                var card_ID = ''
                var renew_ID = ''
                this.allMenusID.map(item => {
                    if (item.name == '会员办卡') {
                        card_ID = item.id
                    }
                    if (item.name == '会员续费') {
                        renew_ID = item.id
                    }
                })
                sessionStorage.setItem('CARD',card_ID + '/' + renew_ID)
            }
        }
    }

    DragStart(e) { //拖动开始/

        let _this = document.querySelector('#move-mark')
        this.setState({
            disY: e.touches[0].clientY - _this.offsetTop,
            starY: e.touches[0].clientY,
        })
        this.flags = true
    }

    Drag(e) {
        // e.preventDefault()
        let _this = document.querySelector('#move-mark')

        if (_this.style.right == '0px' || _this.style.right == '0') {
            return
        }
        this.flags = false

        this.setState({
            T: e.touches[0].clientY - this.state.disY,
            starYEnd: e.touches[0].clientY - this.state.starY
        })

        if (this.state.T < 0) {
            this.setState({
                T: 0
            })
        } else if (this.state.T > document.documentElement.clientHeight - _this.offsetHeight) {
            this.setState({
                T: document.documentElement.clientHeight - _this.offsetHeight
            })
        }

        this.setState({
            moveY: this.state.T < 0 ? '0px': this.state.T > document.documentElement.clientHeight - _this.offsetHeight ? document.documentElement.clientHeight - _this.offsetHeight : this.state.T+'px'
        })
        _this.style.top = this.state.moveY

    }

    DragEnd(e) {
        sessionStorage.setItem('POSITION',e.target.parentNode.parentNode.style.top)
    }

    render() {
        return (
            <div className="quick-nav-container" >
                <div className={ this.state.Status ? "shadow" : "shadow hidden" } onClick={ e => this.changeStatus(e) } ref={ shadowShow => this.shadowShow = shadowShow } ></div>
                <div className="nav-box" id="move-mark"
                    ref={ wrapper => this.wrapper = wrapper }
                    style= { this.state.Status ? { right: '0px' } : { right: menus.length * (-17.5) >-70? menus.length * (-17.5) +'vw':'-70vw' } }
                    onTouchMove={ e => this.Drag(e) }
                    onTouchEnd={ e => this.DragEnd(e) }
                    onClick = { e => this.Loginout(e) }
                >
                    <div className="nav-left" onClick={ e => this.changeStatus(e) } >
                    <span className={ this.state.Status ? "nav-icon off" : "nav-icon" }></span>
                    </div>
                    <div className="nav-right">
                        {
                            this.state.menusAll.map((menu, index) => {
                                return (
                                    <div data-id={ menu.name } key={ index }>
                                        <a href={ menu.link || 'javascript:;' }
                                            data-id = { menu.name }
                                        >
                                        <img src={ menu.src } data-id= { menu.name }/>
                                        <p data-id= { menu.name }>{ menu.name }</p>
                                        </a>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default QuickNav
