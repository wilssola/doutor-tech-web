import React from 'react';

import { Button, Container, Form } from 'react-bootstrap';

import { getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
    const app = getApp();
    const auth = getAuth(app);

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    function login() {
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => console.log(user))
        .catch(error => {
            alert(error.message);
            console.log(error);
        });
    }

    return (
        <Form>
            <Form.Group controlId='formEmail'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <Form.Text className='text-muted'>
                    Need to be a admin email address.
                </Form.Text>
            </Form.Group>

            <Form.Group className='mt-3' controlId='formPassword'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <Form.Text className='text-muted'>
                    Never share your password with anyone else.
                </Form.Text>
            </Form.Group>          
            
            <Button className='mt-3' variant='primary' onClick={login}>LOGIN</Button>
        </Form>
    );
}

export default Login;