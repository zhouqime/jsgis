/**
 * Created with JetBrains WebStorm.
 * User: zhouqi
 * Date: 12-5-29
 * Time: 下午12:58
 * To change this template use File | Settings | File Templates.
 */

var kPrecision = 1e-6;

function TinNode() {
	this.x = 0.0;
	this.y = 0.0;
	//this.edge = null;
}

function TriArea(a, b, c) {
	return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function CCW(a, b, c) {
	return TriArea(a, b, c) > kPrecision;
}

function InCircle(c1, c2, c3, p) {
	if (p == c1 || p == c2 || p == c3)
		return false;

	return (c1.x * c1.x + c1.y * c1.y) * TriArea(c2, c3, p) 
	- (c2.x * c2.x + c2.y * c2.y) * TriArea(c1, c3, p) 
	+ (c3.x * c3.x + c3.y * c3.y) * TriArea(c1, c2, p) 
	- (p.x * p.x + p.y * p.y) * TriArea(c1, c2, c3) > kPrecision;
}

function NodeCmp(n1, n2) {
	var dx = n2.x - n1.x;
	if (dx > kPrecision)
		return -1;
	if (dx < -kPrecision)
		return 1;
	var dy = n2.y - n1.y;
	if (dy > kPrecision)
		return -1;
	if (dy < -kPrecision)
		return 1;
	return 0;
}

function TinEdge() {
	this.next = null;
	this.prev = null;
	this.twin = null;
	this.org = null;
	this.IsPointAtLeft = function(n) {
		return CCW(n, this.org, this.twin.org);
	};

	this.IsPointAtRight = function(n) {
		return CCW(n, this.twin.org, this.org);
	}
}

function SpliceEdge(e1, e2) {
	e1.prev.next = e2;
	e2.prev.next = e1;
	var tmp = e1.prev;
	e1.prev = e2.prev;
	e2.prev = tmp;
}

function MaxEdge() {
	this.le = null;
	this.re = null;
}

function Tin() {
	this.sorted = false;
	this.nodes = new Array();
	this.edges = new Array();
	this.free_edge = null;
	this.AddNode = function(x, y) {
		var n = new TinNode();
		n.x = x;
		n.y = y;
		this.nodes.push(n);
		this.sorted = false;
	};
	this.Clear = function() {
		this.nodes.length = 0;
		this.edges.length = 0;
		this.free_edge = null;
		this.sorted = false;
	};
	this.SortNodes = function() {
		this.nodes.sort(NodeCmp);

		var ns = new Array();
		var ln = this.nodes[0];
		ns.push(ln);
		for (var i = 1; i < this.nodes.length; i++) {
			if (NodeCmp(this.nodes[i], ln) != 0) {
				ns.push(this.nodes[i]);
				ln = this.nodes[i];
			}
		}
		this.nodes = ns;
		this.sorted = true;
	};
	this.DeleteEdgePair = function(e) {
		SpliceEdge(e, e.twin.next);
		SpliceEdge(e.twin, e.next);
		e.org = null;
		e.twin.org = null;
		e.next = e.twin;
		e.twin.next = this.free_edge;
		this.free_edge = e;
	};

	this.NewEdge = function() {
		if (this.free_edge != null) {
			var ret = this.free_edge;
			this.free_edge = this.free_edge.next;
			return ret;
		}
		var e = new TinEdge();
		this.edges.push(e);
		return e;
	};

	this.MakeEdge = function(org, dst) {

		var e1 = this.NewEdge();
		var e2 = this.NewEdge();
		e1.twin = e2;
		e2.twin = e1;
		e1.next = e2;
		e2.next = e1;
		e1.prev = e2;
		e2.prev = e1;
		e1.org = org;
		e2.org = dst;
		return e1;
	};

	this.ConnectEdge = function(e1, e2) {
		var e = this.MakeEdge(e1.twin.org, e2.org);
		SpliceEdge(e, e1.next);
		SpliceEdge(e.twin, e2);
		return e;
	};
	this.Valid = function(e, basel) {
		return CCW(e.twin.org, basel.twin.org, basel.org);
	};
	this.Build = function() {
		if (this.nodes.length < 2)
			return;
		this.edges.length = 0;
		if (!this.sorted)
			this.SortNodes();
		this.BuildBetween(0, this.nodes.length - 1);
		var es = new Array();
		for (var i = 0; i < this.edges.length; i++) {
			var e = this.edges[i];
			if (e.org != null) {
				es.push(e);
			}
		}
		this.edges = es;
		this.free_edge = null;
	};
	this.BuildBetween = function(bi, ei) {
		var nodeCount = ei - bi + 1;
		var maxEdge = new MaxEdge();
		if (nodeCount == 2) {
			var e = this.MakeEdge(this.nodes[bi], this.nodes[ei]);
			maxEdge.le = e;
			maxEdge.re = e.twin;
			return maxEdge;
		} else if (nodeCount == 3) {
			var e1 = this.MakeEdge(this.nodes[bi], this.nodes[bi + 1]);
			var e2 = this.MakeEdge(this.nodes[bi + 1], this.nodes[ei]);
			SpliceEdge(e1.twin, e2);

			if (CCW(this.nodes[bi], this.nodes[bi + 1], this.nodes[ei])) {
				this.ConnectEdge(e2, e1);

				maxEdge.le = e1;
				maxEdge.re = (e2.twin);

				return maxEdge;
			} else if (CCW(this.nodes[bi], this.nodes[ei], this.nodes[bi + 1])) {
				var e3 = this.ConnectEdge(e2, e1);

				maxEdge.le = e3.twin;
				maxEdge.re = e3;

				return maxEdge;
			} else {
				maxEdge.le = e1;
				maxEdge.re = e2.twin;

				return maxEdge;
			}

		} else {
			var mid = Math.floor((bi + ei) / 2);
			var leftRet = this.BuildBetween(bi, mid);
			var rightRet = this.BuildBetween(mid + 1, ei);

			var ldo = leftRet.le;
			var ldi = leftRet.re;
			var rdi = rightRet.le;
			var rdo = rightRet.re;

			while (true) {
				if (ldi.IsPointAtLeft(rdi.org)) {
					ldi = ldi.next;
				} else if (rdi.IsPointAtRight(ldi.org)) {
					rdi = rdi.twin.prev.twin;
				} else {
					break;
				}
			}

			var basel = this.ConnectEdge(rdi.twin, ldi);
			if (ldi.org == ldo.org) {
				ldo = basel.twin;
			}
			if (rdi.org == rdo.org) {
				rdo = basel;
			}

			while (true) {
				var lcand = basel.twin.prev.twin;
				var t = null;
				if (this.Valid(lcand, basel)) {
					while (InCircle(basel.twin.org, basel.org, lcand.twin.org, lcand.prev.org)) {
						t = lcand.prev.twin;
						this.DeleteEdgePair(lcand);
						lcand = t;
					}
				}

				// symmetrically, locate the first R point to be hit, and delete R edges
				var rcand = (basel.twin.next);
				if (this.Valid(rcand, basel)) {
					while (InCircle(basel.twin.org, basel.org, rcand.twin.org, rcand.twin.next.twin.org)) {
						t = rcand.twin.next;
						this.DeleteEdgePair(rcand);
						rcand = t;
					}
				}

				if ((!this.Valid(lcand, basel)) && (!this.Valid(rcand, basel))) {
					break;
				}

				if ((!this.Valid(lcand, basel)) || this.Valid(rcand, basel) && InCircle(lcand.twin.org, lcand.org, rcand.org, rcand.twin.org)) {
					basel = this.ConnectEdge(rcand, basel.twin);
				} else {
					basel = this.ConnectEdge(basel.twin, lcand.twin);
				}
			}
			maxEdge.le = ldo;
			maxEdge.re = rdo;
			return maxEdge;
		}
	};

}

