export interface TreeViewNode {
  uid: string;
  children: TreeViewNode[];

  checked?: boolean;
}
