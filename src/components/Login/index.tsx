import React from 'react';

import { Button, Container, Form } from 'react-bootstrap';

import { getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

function Login() {
    const app = getApp();
    const auth = getAuth(app);

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    function login() {
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => console.log(user))
        .catch(error => alert(error.message));
    }

    function register() {
        createUserWithEmailAndPassword(auth, email, password)
        .then((user) => console.log(user))
        .catch(error => alert(error.message));
    }

    function recoverPassword() {
        sendPasswordResetEmail(auth, email)
        .then(() => alert('Reset email sent.'))
        .catch(error => alert(error.message));
    }

    return (
        <div>
            <h1 className='mb-3'>Doutor Tech</h1>

            <Form>
                <Form.Group controlId='formEmail'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Form.Text className='text-muted'>
                        Need to be a admin email address.
                    </Form.Text>
                </Form.Group>

                <Form.Group className='mt-3' controlId='formPassword'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Form.Text className='text-muted'>
                        Never share your password with anyone else.
                    </Form.Text>
                </Form.Group>          
                
                <Button className='mt-3' variant='primary' onClick={login}>LOGIN</Button>
                &nbsp;
                <Button className='mt-3' variant='secondary' onClick={register}>REGISTER</Button>
                &nbsp;
                <Button className='mt-3' variant='warning' onClick={recoverPassword}>RECOVER PASSWORD</Button>
            </Form>
        </div>
    );
}

export default Login;