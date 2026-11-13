"use strict";

const blacklist = new Set();

function add(jti) {
  blacklist.add(jti);
}

function has(jti) {
  return blacklist.has(jti);
}

function remove(jti) {
  blacklist.delete(jti);
}

function size() {
  return blacklist.size;
}

module.exports = { add, has, remove, size };
