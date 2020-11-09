import { useReducer, useEffect } from "react";
import axios from 'axios';
import API_URL from '../API_URL';


function reducer(state, action) {
    switch (action.type) {
        case 'make-request':
            return { loading: true, jobs: [] }
        case 'get-data':
            return { ...state, loading: false, jobs: action.payload.jobs }
        case 'update-has-next-page':
            return { ...state, hasNextPage: action.payload.hasNextPage }
        case 'error':
            return { ...state, loading: false, error: action.payload.error, jobs: [] }
        default:
            return state
    }

}

export default function useFetch(params, page) {

    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true })

    useEffect(() => {
        const cancelToken1 = axios.CancelToken.source()
        dispatch({ type: 'make-request' })
        axios.get(API_URL, {
            cancelToken: cancelToken1.token,
            params: { markdown: true, page: page, ...params }
        }).then(res => {
            dispatch({ type: 'get-data', payload: { jobs: res.data } })
        }).catch(e => {
            if (axios.isCancel(e)) return
            dispatch({ type: 'error', payload: { error: e } })
        })

        const cancelToken2 = axios.CancelToken.source()
        axios.get(API_URL, {
            cancelToken: cancelToken2.token,
            params: { markdown: true, page: page + 1, ...params }
        }).then(res => {
            dispatch({ type: 'update-has-next-page', payload: { hasNextPage: res.data.length !== 0 } })
        }).catch(e => {
            if (axios.isCancel(e)) return
            dispatch({ type: 'error', payload: { error: e } })
        })

        return () => {
            cancelToken1.cancel()
            cancelToken2.cancel()
        }
    }, [params, page])

    return state
}