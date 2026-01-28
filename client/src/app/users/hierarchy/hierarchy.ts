import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface UserNode {
  _id: string;
  username: string;
  balance: number;
  parent: string;
  children?: UserNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  balance: number;
}

@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './hierarchy.html',
  styleUrls: ['./hierarchy.css']
})
export class HierarchyComponent implements OnInit {

  private _transformer = (node: UserNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.username,
      level: level,
      balance: node.balance
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getDownline().subscribe({
      next: (users: any[]) => {
        this.dataSource.data = this.buildTree(users);
      },
      error: (err) => console.error(err)
    });
  }

  buildTree(users: any[]): UserNode[] {

    const nodeMap = new Map<string, UserNode>();
    users.forEach(u => {
      nodeMap.set(u._id, { ...u, children: [] });
    });

    const tree: UserNode[] = [];


    users.forEach(u => {
      const node = nodeMap.get(u._id)!;

      if (u.parent && nodeMap.has(u.parent)) {
        nodeMap.get(u.parent)!.children!.push(node);
      } else {

        tree.push(node);
      }
    });

    return tree;
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
