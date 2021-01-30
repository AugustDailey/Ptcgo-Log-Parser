function* build(logs) {
    let start = 0, size = logs.length;
    for (let i = start; i < size; i++) {
        yield logs[i];
    }
    return null;
}