export interface BlogPost {
  id: string;
  title: string;
  desc: string;
  content?: string;
  author: string;
  read: string;
  img: string;
  tag: string;
  date: string;
  isFeatured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    "id": "3",
    "title": "Word Checker v2.0 Release Notes",
    "desc": "We have updated the regex engine for the Word Checker tool to support case-insensitive matching.",
    "content": "\n      <p>The new update includes support for case-insensitive matching by default.</p>\n      <br/>\n      <p><strong>New Features:</strong></p>\n      <ul>\n        <li>• Faster processing speed</li>\n        <li>• Support for .csv file uploads</li>\n        <li>• Improved error highlighting</li>\n      </ul>\n    ",
    "author": "Developer",
    "read": "2 min read",
    "img": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000",
    "tag": "Update",
    "date": "Nov 02, 2023",
    "isFeatured": false
  },
  {
    "id": "2",
    "title": "Optimizing Tekla Workflow with Custom Components",
    "desc": "Discover how to create robust custom components to automate repetitive connections and save hours of detailing time.",
    "content": "\n      <p>Custom components are the lifeblood of efficient detailing in Tekla Structures. By using parametric modeling, you can ensure that changes in beam sizes or framing conditions automatically update the connection details.</p>\n      <br/>\n      <h3>Key Takeaways:</h3>\n      <p>Start by defining your input points carefully. The primary input point determines the component's origin...</p>\n    ",
    "author": "Developer",
    "read": "5 min read",
    "img": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1000",
    "tag": "Tutorial",
    "date": "Oct 24, 2023",
    "isFeatured": true
  }
];