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
    const lastClientCommit = CONFIG.git_last_commit;
    const commits = [...(lastCommits||[]), lastClientCommit]
    return <div className='hidden-xs' style={{textAlign:'right'}}>
        {  commits ? commits.map((c) => 
            <p key={c.hash}><nobr>{c.repository.includes('data') ? 'data' : 'code'} last update:</nobr> <a href={`${c.repository}/commit/${c.hash}`}><nobr>{new Intl.DateTimeFormat('en-GB',{year: 'numeric', month: 'numeric', day: 'numeric',hour: 'numeric', minute: 'numeric', second: 'numeric',timeZoneName:"short"}).format(new Date(c.date))}</nobr></a></p>) : ''
        }
        </div>;
  }
}
