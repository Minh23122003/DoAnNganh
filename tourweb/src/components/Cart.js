import { useCallback, useEffect, useMemo, useState } from "react";
import cookie from "react-cookies"
import APIs, { authAPIs, endpoints } from "../configs/APIs";
import { Button, Table } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const Cart = () => {
    const [booking, setBooking] = useState([])
    const [user] = useState(cookie.load("user"))
    const [q] = useSearchParams()
    const nav = useNavigate()
    const [a, setA] = useState(0)

    const loadBooking = async () => {
        try{
            let token = cookie.load("access-token")
            let res = await authAPIs(token).get(endpoints['booking'])
            setBooking(res.data)
        }catch(ex){
            console.error(ex)
        }
    }

    useEffect(() => {
        loadBooking();

        // setTimeout(() => {
        //     let a = q.get('orderId')
        //     if (a !== null)
        //         checkStatus();
        // }, 1000);
        
    }, [a])

    useEffect(() => {
        let order = q.get('orderId')
        if (order !== null)
            checkStatus();
    }, [])

    const checkStatus = async () => {
        if (cookie.load('dataPay') !== undefined){
            if (cookie.load('payAll') === undefined){
                try{
                    let res = await APIs.post(endpoints['check-status'], {
                        'orderId': cookie.load('dataPay').orderId
                    })
                    if (res.data.resultCode === 0)
                        pay(cookie.load('orderId'), cookie.load('amount'), res.data.payType)
                }catch(ex){
                    console.error(ex)
                }
            }
            else{
                try{
                    let res = await APIs.post(endpoints['check-status'], {
                        'orderId': cookie.load('dataPay').orderId
                    })
                    if (res.data.resultCode === 0)
                        payAll(res.data.payType)
                }catch(ex){
                    console.error(ex)
                }
            }
            setTimeout(() => {
                setA(100)
            }, 1000);
            nav('/cart')
        }
    }

    const pay = async (id, total, method) => {
        try{
            let res = await APIs.post(endpoints['pay'], {
                'id': id,
                'method_pay': method,
                'total': total
            })
            if(res.status===200){
                cookie.remove('dataPay')
                cookie.remove('orderId')
                cookie.remove('amount')
            }
        }catch(ex){
            console.error(ex)
        }
    }

    const deleteBooking = async (id) => {
        if(window.confirm("Bạn muốn hủy đặt vé này?") === true){
            try{
                let token = cookie.load("access-token")
                let res = await authAPIs(token).delete(endpoints['deleteBooking'](id))
                setA(a - 1)
            }catch(ex){
                console.error(ex)
            }
        }
    }

    const payAll = async (method) => {
        try{
            let res = await APIs.post(endpoints['payAll'], {
                'user_id': user.id,
                'method_pay': method
            })
            if(res.status === 200){
                cookie.remove('dataPay')
                cookie.remove('payAll')
            }
        }catch(ex){
            console.error(ex)
        }
    }

    const getLinkMomo = async (id, amount, payAll) => {
        if (payAll === false){
            try {
                let res = await APIs.post(endpoints['getLinkMomo'], {
                    'amount': amount
                })
                if (res.status === 200){
                    cookie.save('dataPay', res.data)
                    cookie.save('orderId', id)
                    cookie.save('amount', amount)
                    window.location.href = res.data.payUrl
                }
            }catch (ex){
                console.error(ex)
            }
        }
        else{
            let total = 0
            for (let b of booking)
                if(b.is_pay === false)
                    total = total + b.quantity * b.price.price
            if ( total === 0)
                window.alert("Bạn không có tour cần thanh toán!")
            else{
                try {
                    let res = await APIs.post(endpoints['getLinkMomo'], {
                        'amount': total
                    })
                    if (res.status === 200){
                        cookie.save('dataPay', res.data)
                        cookie.save('payAll', true)
                        window.location.href = res.data.payUrl
                    }
                }catch (ex){
                    console.error(ex)
                }
            }
        }
    }

    return (
        <>
        <h1 className="text-center mt-3">Danh sách các tour du lịch đã đặt</h1>
        <Button className="mt-3 mb-3" onClick={() => getLinkMomo(null, null, true)}>Thanh toán tất cả</Button>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Tên tour du lịch</th>
                    <th>Loại vé</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {booking.map(b => <tr key={b.id}>
                    <th>{b.tour_name}</th>
                    <th>{b.price.type}</th>
                    <th>{b.price.price}</th>
                    <th>{b.quantity}</th>
                    <th>{new Date(b.created_date).toLocaleDateString()}</th>
                    <th>{b.quantity * b.price.price}</th>
                    <th>{b.is_pay===true?"Đã thanh toán":"Chưa thanh toán"}</th>
                    <th>{b.is_pay===false?<Button onClick={() => deleteBooking(b.id)} variant="danger">Hủy đặt vé</Button>:<></>}</th>
                    <th>{b.is_pay===false?<Button onClick={() => getLinkMomo(b.id, b.quantity * b.price.price, false)}>Thanh toán</Button>:<></>}</th>
                    <th>{new Date(b.tour_start_date)<new Date()?<Button onClick={() => cookie.save("booking", b)} ><Link className="nav-link" to='/rating' >Đánh giá</Link></Button>:<></>}</th>
                </tr>)}
            </tbody>
        </Table>
        </>
    );
}

export default Cart;