import { fabric } from "fabric"
import simplify from './simplify'

fabric.Object.prototype.cornerColor = 'rgba(0, 0, 255, 0.5)'
fabric.Object.prototype.borderColor = "rgba(0, 0, 255, 0.3)"
fabric.Textbox.prototype.editingBorderColor = "rgba(0, 0, 255, 0.5)"
fabric.PencilBrush.prototype.convertPointsToSVGPath = function (points) {
	var newPoint = simplify(points, 1.5, false)
	var path = [], i, width = this.width / 1000,
		p1 = new fabric.Point(newPoint[0].x, newPoint[0].y),
		p2 = new fabric.Point(newPoint[1].x, newPoint[1].y),
		len = newPoint.length, multSignX = 1, multSignY = 0, manyPoints = len > 2;
	if (manyPoints) {
		multSignX = newPoint[2].x < p2.x ? -1 : newPoint[2].x === p2.x ? 0 : 1;
		multSignY = newPoint[2].y < p2.y ? -1 : newPoint[2].y === p2.y ? 0 : 1;
	}
	path.push('M ', Number(p1.x - multSignX * width).toFixed(1), ' ', Number(p1.y - multSignY * width).toFixed(1), ' ');
	for (i = 1; i < len; i++) {
		if (!p1.eq(p2)) {
			var midPoint = p1.midPointFrom(p2);
			path.push('Q ', Number(p1.x).toFixed(1), ' ', Number(p1.y).toFixed(1), ' ', Number(midPoint.x).toFixed(1), ' ', Number(midPoint.y).toFixed(1), ' ');
		}
		p1 = newPoint[i];
		if ((i + 1) < newPoint.length) {
			p2 = newPoint[i + 1];
		}
	}
	if (manyPoints) {
		multSignX = p1.x > newPoint[i - 2].x ? 1 : p1.x === newPoint[i - 2].x ? 0 : -1;
		multSignY = p1.y > newPoint[i - 2].y ? 1 : p1.y === newPoint[i - 2].y ? 0 : -1;
	}
	path.push('L ', Number(p1.x + multSignX * width).toFixed(1), ' ', Number(p1.y + multSignY * width).toFixed(1));
	return path;
}