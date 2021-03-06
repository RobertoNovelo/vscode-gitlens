'use strict';
import { Iterables } from '../system';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { CommitNode } from './commitNode';
import { ExplorerNode, MessageNode, ResourceType } from './explorerNode';
import { GitService, GitUri } from '../gitService';

export class FileHistoryNode extends ExplorerNode {

    readonly resourceType: ResourceType = 'gitlens:file-history';

    constructor(uri: GitUri, protected readonly context: ExtensionContext, protected readonly git: GitService) {
        super(uri);
     }

    async getChildren(): Promise<ExplorerNode[]> {
        const log = await this.git.getLogForFile(this.uri.repoPath, this.uri.fsPath, this.uri.sha);
        if (log === undefined) return [new MessageNode('No file history')];

        return [...Iterables.map(log.commits.values(), c => new CommitNode(c, this.git.config.gitExplorer.commitFormat, this.context, this.git))];
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(`${this.uri.getFormattedPath()}`, TreeItemCollapsibleState.Expanded);
        item.contextValue = this.resourceType;

        item.iconPath = {
            dark: this.context.asAbsolutePath('images/dark/icon-history.svg'),
            light: this.context.asAbsolutePath('images/light/icon-history.svg')
        };

        return item;
    }
}