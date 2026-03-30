const ItemCard = ({ id, title, price, unit }) => (
  <Col xl={2} lg={4} md={6} sm={6} xs={6}>
    <Card className="border border-success position-relative">
      <Card.Body className="p-3">
        <div className="top-agents-container">
          <div className="top-agent d-flex align-items-start">
            <div className="agent-details overflow-hidden flex-column flex-1">
              <small className="price-tag bg-success">${price}</small>
              <h5>{title}</h5>
              <div className="agent-score">
                <div className="points left">{unit}</div>
              </div>
            </div>
            <div className="corner-place my-3">
              <a href="#!" className="corner-edit" onClick={() => edit_item(id)}><i className="icon-edit1" /></a>
              <a href="#!" className="corner-delete" onClick={() => del_item(id)}><i className="icon-trash-2" /></a>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);
