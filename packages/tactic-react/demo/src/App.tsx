import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { PageDemoDecoratorBasic } from './pages/PageDemoDecoratorBasic'

export const App = () =>
    <BrowserRouter>
        <div style={{display: 'flex', flexDirection: 'column', margin: '0 24px'}}>
            <div style={{display: 'flex'}} className={'py1 ob o-divider'}>
                <Link to={'/simple-plugin'} className={'mx1'}>Decorator Basic</Link>
                <Link to={'/by-data-list'} className={'mx1'}>by Data List</Link>
                <Link to={'/by-data-object'} className={'mx1'}>by Data Object</Link>
                <Link to={'/by-data-tree'} className={'mx1'}>by Data Tree</Link>
                <Link to={'/by-schema'} className={'mx1'}>by Schema / Form</Link>
            </div>
            <Routes>
                <Route path="simple-plugin" element={<PageDemoDecoratorBasic/>}/>
            </Routes>
        </div>
    </BrowserRouter>
