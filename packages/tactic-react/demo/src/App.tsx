import React from 'react'
import { PageDemoByDataList } from './pages/PageDemoByDataList'
import {
    BrowserRouter, Routes, Route, Link,
} from 'react-router-dom'

export const App = () =>
    <BrowserRouter>
        <div style={{display: 'flex', flexDirection: 'column', margin: '0 24px'}}>
            <div style={{display: 'flex'}} className={'py1 ob o-divider'}>
                <Link to={'/by-data-list'} className={'mx1'}>by Data List</Link>
                <Link to={'/by-data-object'} className={'mx1'}>by Data Object</Link>
                <Link to={'/by-data-tree'} className={'mx1'}>by Data Tree</Link>
                <Link to={'/by-schema'} className={'mx1'}>by Schema / Form</Link>
            </div>
            <Routes>
                <Route path="by-data-list" element={<PageDemoByDataList/>}/>
            </Routes>
        </div>
    </BrowserRouter>
