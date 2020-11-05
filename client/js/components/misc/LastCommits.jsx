/**
 * TOFLIT18 Last Commits info Component
 * ======================================
 * Displays the code and data last commit date + link
 */
import React, { Component } from "react";
import { branch } from "baobab-react/decorators";

@branch({
    cursors: {
      lastCommits: ["data", "lastCommits"],
    },
  })
export default class LastCommits extends Component {
  render() {
    const {lastCommits} = this.props
    console.log('lastcommits', lastCommits);
    return <div className='hidden-xs' style={{textAlign:'right'}}>
        {  lastCommits ? lastCommits.map((c) => 
            <p key={c.hash}><nobr>{c.repository.includes('data') ? 'data' : 'code'} last update:</nobr> <a href={`${c.repository}/commit/${c.hash}`}><nobr>{c.date}</nobr></a></p>) : ''
        }
        </div>;
  }
}
