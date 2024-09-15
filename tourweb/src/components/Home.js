import { useEffect, useState } from "react";
import APIs, { endpoints } from "../configs/APIs";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import cookie from "react-cookies";

const Home = () => {
    const [tours, setTours] = useState([])
    const [category, setCategory] = useState([])
    const [cateId, setCateId] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [startDate, setStartDate] = useState("")
    const [location, setLocation] = useState("")
    const [page, setPage] = useState(1)
    const nav = useNavigate();
    const [q] = useSearchParams();
    const [disabled, setDisabled] = useState(false)

    const loadTours = async () => {
        if (page > 0){
            try{
                let url = `${endpoints["tours"]}?page=${page}`

                let a = q.get("location");
                if (a !== "" && a !== null) {
                    setPage(1);
                    url = `${url}&location=${a}`;
                }
                let min = q.get("price_min");
                if (min !== "" && min !== null) {
                    setPage(1);
                    url = `${url}&price_min=${min}`;
                }
                let max = q.get("price_max");
                if (max !== "" && max !== null) {
                    setPage(1);
                    url = `${url}&price_max=${max}`;
                }
                let start = q.get("start_date");
                if (start !== "" && start !== null) {
                    setPage(1);
                    url = `${url}&start_date=${start}`;
                }
                let cate = q.get("cate_id");
                if (cate !== "" && cate !== null) {
                    setPage(1);
                    url = `${url}&cate_id=${cate}`;
                }

                let res = await APIs.get(url)
                
                if(page === 1)
                    setTours(res.data.results)
                else
                    setTours(current => [...current, ...res.data.results])

                if (res.data.next === null){
                    setDisabled(true)
                    setPage(-99)
                }
            }catch (ex){
                console.error(ex)
            }
        }
    }

    const loadCategory = async () =>{
        try{
            let res = await APIs.get(endpoints['category'])
            setCategory(res.data)
        }catch (ex){
            console.error(ex)
        }
    }

    useEffect(() => {
        loadCategory();
    }, [])

    useEffect(() => {
        loadTours();
    }, [page, q, disabled])

    const loadMore = (e) => {
        e.preventDefault();
        setPage(page + 1);
    }

    const submit = (e) => {
        e.preventDefault();

        nav(`/?location=${location}&price_min=${minPrice}&price_max=${maxPrice}&cate_id=${cateId}&start_date=${startDate}`);
    }

    return (
        <>
        <Form inline onSubmit={submit}>
            <Row>
                <Col xs="auto">
                    <Form.Control
                        type="number"
                        placeholder="Tìm giá nhỏ nhất..."
                        className=" mr-sm-2"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                    />
                </Col>
                <Col xs="auto" >
                    <Form.Control
                        type="number"
                        placeholder="Tìm giá lớn nhất..."
                        className=" mr-sm-2"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                    />
                </Col>
                <Col xs="auto" >
                    <Form.Control
                        type="date"
                        placeholder="Tìm ngày khởi hành..."
                        className=" mr-sm-2"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </Col>
                <Col xs="auto" >
                    <Form.Control
                        type="text"
                        placeholder="Tìm điểm đến..."
                        className=" mr-sm-2"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Form.Select onChange={e => setCateId(e.target.value)}>
                    <option key={0} value={""}>Tất cả</option>
                    {category.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Button type="submit">Tìm tour</Button>
                </Col>
            </Row>
        </Form>

        <h1 className="text-center text-info mt-2">Danh sách các tour du lịch</h1>

        <Row className="text-center">
        {tours.length === 0 ? <h3 className="m-3">Không có tour phù hợp</h3>: tours.map(t => <Col key={t.id} xs="11" md="5" className="m-2">
        <Card>
            <Card.Img variant="top" src={t.images[0].image} height={300}/>
            <Card.Body>
                <Card.Title>{t.name}</Card.Title>
                <Button variant="primary" className="m-3"><Link onClick={()=>cookie.save('tour', t)} className="nav-link" to="/tourDetails">Xem chi tiết</Link></Button>
                <Button variant="primary" className="m-3"><Link onClick={() => cookie.save("tour", t)} className="nav-link" to="/booking">Đặt tour</Link></Button>
            </Card.Body>
        </Card>
        </Col>)}
        </Row>
        <div className="mt-2 text-center mb-1">
            <Button disabled={disabled} onClick={loadMore} variant="primary">Xem thêm</Button>
        </div>
        </>
    );
}

export default Home;