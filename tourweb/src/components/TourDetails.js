import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Image, Row } from "react-bootstrap";
import cookie from "react-cookies";
import APIs, { authAPIs, endpoints } from "../configs/APIs";
import moment from 'moment';
import 'moment/locale/vi'
import { Link } from "react-router-dom";

const TourDetails = () => {
    const [tour] = useState(cookie.load("tour"));
    const [user] = useState(cookie.load("user"));
    const [comment, setComment]= useState([]);
    const [page, setPage] = useState(1);
    const [quantity, setQuantity] = useState('');
    const [hide, setHide] = useState("inline")
    const [content, setContent] = useState("")

    const loadComments= async () => {
        if (page > 0){
            try{
                let res = await APIs.get(`${endpoints['comment'](tour.id)}?page=${page}`);
                setQuantity(res.data.count)
                if(page===1)
                    setComment(res.data.results)
                else if(page > 1)
                    setComment(current => {return [...current, ...res.data.results]})
                if(res.data.next===null){
                    setPage(-99)
                    setHide("none")
                }          
            }catch (ex){
                console.error(ex)
            }
        }
    }
    
    useEffect(() => {
        loadComments();
    }, [quantity, page, hide])

    const loadMore = (e) => {
        e.preventDefault();
        setPage(page + 1)
    }

    const deleteComment = async (id) => {
        if (window.confirm("Bạn chắc chắn xóa bình luận này?") === true){
            try{
                let res = await APIs.delete(endpoints["deleteComment"](id))

                if(res.status === 204){
                    setPage(1)
                    setQuantity(quantity - 1)
                    setHide("inline")
                }   
            }catch(ex) {
                console.error(ex)
            }
        }
    }

    const addComment = async () => {
        if (user === null)
            alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để bình luận!")
        else{
            try{
                let token = cookie.load("access-token")
                let res = await authAPIs(token).post(endpoints['addComment'](tour.id), {
                    'content': content
                })
                if (res.status === 201){
                    setQuantity(0)
                    setPage(1)
                    setHide("inline")
                }

            }catch(ex) {
                console.error(ex)
            }
        }
    }

    return (
        <>
        <Row>
            <Col md="5" xs="12">
                <h1>{tour.name}</h1>
                <Row>
                    <Col md="5">
                        <div>Ngày bắt đầu: {new Date(tour.start_date).getDate()}/{new Date(tour.start_date).getMonth() + 1}/{new Date(tour.start_date).getFullYear()}</div>
                        <div>Ngày kết thúc: {new Date(tour.end_date).getDate()}/{new Date(tour.end_date).getMonth() + 1}/{new Date(tour.end_date).getFullYear()}</div>
                    </Col>
                    <Col md="7"><Button><Link className="nav-link" to="/booking" >Đặt tour</Link></Button></Col>
                </Row>
                <div>Số vé còn lại: {tour.remain_ticket}</div>
                <div>Giá vé:</div>
                <ul>
                {tour.prices.map(p => <li key={p.id}>{p.type}: {p.price} VNĐ</li>)}
                </ul>
                <div className="mb-3">Các địa điểm tham quan</div>
                <ol>
                    {tour.destination.map(d => <li key={d.id}>{d.name} - {d.location}</li>)}
                </ol>
                <div className="mt-3 mb-3">Ghi chú: {tour.note}</div>
                <div dangerouslySetInnerHTML={{__html: tour.description}} ></div>
            </Col>
            <Col md="7" xs="12">
                <Row>
                {tour.images.map(i => <Col md="5" xs="12" key={i.id}>
                    <Card className="m-3">
                        <Card.Img src={i.image} />
                        <Card.Body>
                            <Card.Title className="text-center fst-italic">{i.name}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>)}
                </Row>
                <Row>
                    <Col md="9">
                        <Form.Control type="text" className="mb-3" placeholder="Nhập bình luận" value={content} onChange={e => setContent(e.target.value)} />
                    </Col>
                    <Col md="2"><Button onClick={addComment}>Đăng</Button></Col>
                </Row>
                <div className="mb-3 bg-light p-3">Bình luận ({quantity} bình luận):</div>
                {comment.map(c => <div key={c.id}>
                    <Row className="m-3 p-3" style={{backgroundColor:"lightblue"}}>
                        <Col md="2"><Image width={50} src={c.user.avatar} /></Col>
                        <Col md="4">{c.user.first_name} {c.user.last_name}</Col>
                        <Col md="3">{moment(c.updated_date).fromNow()}</Col>
                        <Col md="3">{user.id === c.user.id?<Button onClick={() => deleteComment(c.id)} >Xóa bình luận</Button>:<></>}</Col>
                        <div>{c.content}</div>
                    </Row>
                </div>)}
                <Link className="nav-link text-primary text-decoration-underline m-3" style={{display:hide}} onClick={loadMore}>Xem thêm bình luận</Link>
            </Col>
        </Row>
        </>
    );
}

export default TourDetails;