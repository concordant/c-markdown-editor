import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { client } from '@concordant/c-client';
import CMDEd from './Components/CMDEd';

const CONFIG = require('./config.json');

const session = client.Session.Companion.connect(CONFIG.dbName, CONFIG.serviceUrl, CONFIG.credentials);
const collection = session.openCollection("mdeditor", false);

ReactDOM.render(
    <>
        <div className="header background-turquoise padding">
            <h1>C-Markdown Editor</h1>
            <h2>Collaborative Markdown editor using Concordant CRDTs</h2>
        </div>
        <div className="intro reduceWidth">
            <p>
                Our collaborative editor enables multiple users to collaborate
                over a shared text document. It supports both synchronous and
                asynchronous modes. In synchronous mode, multiple users
                connected and see each others' edits in real time. In
                asynchronous mode, a user works disconnected, and his/her
                updates are merged into the shared document when he/she
                reconnects. Switching between synchronous and asynchrounous
                modes is seamless: the editor continues to work without a
                hitch, and without any loss of data.
            </p>
            <p>
                The Markdown editor exercises the RGA and LWWMap CRDTs.
            </p>
        </div>
        <CMDEd session={session} collection={collection} placeholder={CONFIG.defaultText} />
        <div className="padding">
            <p className="footer">© CONCORDANT 2021.</p>
        </div>
    </>,
    document.getElementById('root')
);
