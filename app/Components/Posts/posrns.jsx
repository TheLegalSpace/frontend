let state = { count: 0 }

function useState(initial) {
    let val = initial
    const get = () => val
    const set = (updaterOrValue) => {
        val = typeof updaterOrValue === 'function' ? updaterOrValue(val): updaterOrValue
        render()
    };
    return [get, set]
}

function increment() {
    setCount(prev => prev + 1)
}