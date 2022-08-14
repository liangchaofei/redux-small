function createStore(reducer, enhancer) {
    // 当传入 enhancer
    if (enhancer) {
        return enhancer(createStore)(reducer);
    }

    let state = null;
    let listeners = [];

    function dispatch(action) {
        state = reducer(state, action);
        listeners.forEach((listener) => listener());
    }

    function getState() {
        return state;
    }

    function subscribe(listener) {
        listeners.push(listener);

        return function unsubscribe() {
            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
        };
    }

    dispatch({
        type: 'INIT',
    });

    return {
        dispatch,
        getState,
        subscribe,
    };
}

// function middleware({dispatch, getState}) {
//   return (next) => {
//     return (action) => {
//       return next(action);
//     };
//   };
// }

// createStore(reducer, applyMiddleware(a, b, c))
function applyMiddleware(...middlewares) {
    return (createStore) => (reducer) => {
        const store = createStore(reducer);

        const middlewareAPI = {
            getState: store.getState,
            dispatch: (action, ...args) => store.dispatch(action, ...args),
        };

        const middlewareChain = middlewares.map((middleware) =>
            middleware(middlewareAPI)
        );

        const dispatch = compose(...middlewareChain)(store.dispatch);

        return {
            ...store,
            dispatch,
        };
    };
}

function compose(...funcs) {
    if (funcs?.length === 0) {
        // 没有中间件
        return (args) => args;
    }

    if (funcs?.length === 1) {
        // 只有1个中间件
        return funcs[0];
    }

    // 多个中间件
    return funcs.reduce(
        (prev, next) =>
            (...args) =>
                prev(next(...args))
    );
}

function logger({ dispatch, getState }) {
    return (next) => (action) => {
        const prevState = getState();
        console.log('start logging.............');
        console.log('prev state', prevState);
        console.log('action', action);
        const result = next(action);
        const nextState = getState();
        console.log('next state', nextState);
        console.log('end logging........');
        return result;
    };
}

// 测试用例
const reducer = (state, action) => {
    switch (action.type) {
        case 'inc':
            return state + 1;
        case 'dec':
            return state - 1;
        default:
            return 0;
    }
};

const store = createStore(reducer, applyMiddleware(logger));
const { subscribe, dispatch, getState } = store;

subscribe(() => {
    const state = getState();
    console.log(11111);
    console.log(state);
});

dispatch({
    type: 'inc',
});
