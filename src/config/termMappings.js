// Configuration for IT terms mapping with sub-terms and related terms

export const IT_TERMS_MAPPING = {
  array: [
    "array",
    "arrays",
    "array insertion",
    "array deletion",
    "array traversal",
    "array sorting",
    "array searching",
    "dynamic array",
    "static array",
    "array operations",
    "insert array",
    "delete array",
    "array element",
    "array index",
    "array size",
    "array length",
    "one dimensional array",
    "2d array",
    "multidimensional array",
  ],

  binary_tree: [
    "binary tree",
    "binary trees",
    "btree",
    "b-tree",
    "tree traversal",
    "inorder",
    "preorder",
    "postorder",
    "tree insertion",
    "tree deletion",
    "binary search tree",
    "bst",
    "tree node",
    "root node",
    "leaf node",
    "tree height",
    "tree depth",
    "left child",
    "right child",
    "parent node",
    "tree balancing",
    "avl tree",
  ],

  linked_list: [
    "linked list",
    "linked lists",
    "singly linked list",
    "doubly linked list",
    "circular linked list",
    "list insertion",
    "list deletion",
    "list traversal",
    "head node",
    "tail node",
    "next pointer",
    "previous pointer",
    "node insertion",
    "node deletion",
    "list operations",
    "linked list node",
  ],

  stack: [
    "stack",
    "stacks",
    "lifo",
    "last in first out",
    "push operation",
    "pop operation",
    "stack overflow",
    "stack underflow",
    "stack pointer",
    "call stack",
    "stack top",
    "stack bottom",
    "stack operations",
    "push",
    "pop",
    "peek",
    "stack implementation",
  ],

  queue: [
    "queue",
    "queues",
    "fifo",
    "first in first out",
    "enqueue",
    "dequeue",
    "circular queue",
    "priority queue",
    "queue operations",
    "front",
    "rear",
    "queue front",
    "queue rear",
    "queue implementation",
    "double ended queue",
    "deque",
  ],

  merge_sort: [
    "merge sort",
    "merge sorting",
    "mergesort",
    "divide and conquer",
    "merge operation",
    "sorting algorithm",
    "merge step",
    "divide step",
    "conquer step",
    "merge sort algorithm",
    "stable sorting",
    "external sorting",
  ],

  osi_model: [
    "osi model",
    "osi",
    "seven layer model",
    "physical layer",
    "data link layer",
    "network layer",
    "transport layer",
    "session layer",
    "presentation layer",
    "application layer",
    "layer 1",
    "layer 2",
    "layer 3",
    "layer 4",
    "layer 5",
    "layer 6",
    "layer 7",
    "osi layers",
    "seven layers",
    "network model",
    "protocol stack",
  ],

  client_server: [
    "client server",
    "client-server",
    "client server model",
    "client server architecture",
    "server",
    "client",
    "request response",
    "server client",
    "distributed system",
    "network architecture",
    "client application",
    "server application",
    "web server",
    "database server",
    "file server",
  ],

  firewall: [
    "firewall",
    "firewalls",
    "network firewall",
    "packet filtering",
    "security firewall",
    "firewall rules",
    "network security",
    "access control",
    "traffic filtering",
    "security barrier",
    "network protection",
    "intrusion prevention",
    "packet inspection",
    "stateful firewall",
    "stateless firewall",
  ],

  router: [
    "router",
    "routers",
    "network router",
    "routing",
    "routing table",
    "routing protocol",
    "packet routing",
    "network routing",
    "route",
    "routing algorithm",
    "gateway",
    "network gateway",
    "routing decision",
    "hop",
    "next hop",
    "routing path",
  ],
}

// Stop words to filter out during matching
export const STOP_WORDS = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
]

// Synonyms for better matching
export const SYNONYMS = {
  insertion: ["insert", "add", "adding", "append", "put"],
  deletion: ["delete", "remove", "removing", "erase", "clear"],
  traversal: ["traverse", "walk", "visit", "iterate"],
  searching: ["search", "find", "lookup", "locate"],
  sorting: ["sort", "order", "arrange", "organize"],
}

// Get all possible terms for a main category
export const getAllTermsForCategory = (mainTerm) => {
  return IT_TERMS_MAPPING[mainTerm] || []
}

// Get main category from any sub-term
export const getMainCategoryFromTerm = (searchTerm) => {
  const lowerSearchTerm = searchTerm.toLowerCase()

  for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
    if (subTerms.some((term) => term.toLowerCase().includes(lowerSearchTerm))) {
      return mainTerm
    }
  }

  return null
}

// Get all terms as flat array for searching
export const getAllTerms = () => {
  const allTerms = []
  for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
    allTerms.push(...subTerms.map((term) => ({ term, mainCategory: mainTerm })))
  }
  return allTerms
}
