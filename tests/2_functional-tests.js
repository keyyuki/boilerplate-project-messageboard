const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

suite('Functional Tests', function() {

    it('Creating a new thread', (done) => {
        chai.request(server).post('/api/threads/testthread').send({
            text: 'this is test thread',
            delete_password: '1123'
        }).end((error, res) => {
            res.should.have.status(200);
            done();
        })
    });
    it('Get Thread', (done) => {
        chai.request(server).get('/api/threads/testthread').end((error, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.gt(0);
            res.body.length.should.be.lt(11);
            done();
        })
    })
    it('Report thread', (done) => {
        chai.request(server).get('/api/threads/testthread').end((e,r) => {
            const id = r.body[0]._id
            chai.request(server).put('/api/threads/testthread').send({ report_id: id}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.equal('success');
                
                done();
            })
        })        
    })
    it('Delete Thread invalid password', (done) => {
        chai.request(server).get('/api/threads/testthread').end((e,r) => {
            const id = r.body[0]._id
            chai.request(server).delete('/api/threads/testthread').send({delete_password: '123', thread_id: id}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.be.equal('incorrect password');
                
                done();
            })
        })
    })
    
    it('Delete Thread valid password', (done) => {
        chai.request(server).get('/api/threads/testthread').end((e,r) => {
            const id = r.body[0]._id
            chai.request(server).delete('/api/threads/testthread').send({delete_password: '1123', thread_id: id}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.equal('success');
                
                done();
            })
        })        
    })
    
    
    let threadTestId = ''
    it('Create reply', (done) => {
        chai.request(server).get('/api/threads/testthread').end((e,r) => {
            const id = r.body[0]._id
            threadTestId = id
            chai.request(server).post('/api/replies/testthread').send({
                delete_password: '11234', 
                thread_id: id, 
                text: 'test reply'
            }).end((error, res) => {
                res.should.have.status(200);
                
                
                done();
            })
        })        
    })
    
    
    it('Get reply', (done) => {
        console.log("get at", threadTestId)
        chai.request(server).get('/api/replies/testthread?thread_id=' + threadTestId).end((error, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.replies.should.be.a('array');
            res.body.replies.length.should.be.gt(0);
            done();
        })         
    })
    
    it('Report reply', (done) => {
        chai.request(server).get('/api/replies/testthread?thread_id='+threadTestId).end((e,r) => {
            const id = r.body.replies[0]._id
            
            chai.request(server).put('/api/replies/testthread').send({ thread_id: threadTestId, reply_id: id}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.equal('success');
                
                done();
            })
        })        
    })
    
    it('Delete reply invalid password', (done) => {
        chai.request(server).get('/api/replies/testthread?thread_id='+threadTestId).end((e,r) => {
            const id = r.body.replies[0]._id
            
            chai.request(server).delete('/api/replies/testthread').send({ thread_id: threadTestId, reply_id: id, delete_password: '123'}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.equal('incorrect password');
                
                done();
            })
        })        
    })
    
    it('Delete reply valid password', (done) => {
        chai.request(server).get('/api/replies/testthread?thread_id='+threadTestId).end((e,r) => {
            const id = r.body.replies[0]._id
            
            chai.request(server).delete('/api/replies/testthread').send({ thread_id: threadTestId, reply_id: id, delete_password: '11234'}).end((error, res) => {
                res.should.have.status(200);
                res.text.should.equal('success');
                
                done();
            })
        })        
    })
});
