Vue.filter('triangle', function (value) {
    return Math.round(value *360 / 2 / Math.PI)+'°';
})
var app = new Vue({
    el: '#app',
    data: {
        canvas : { width :1000, height : 0, background : '#2e3441' },
        radius : 50,
        step : 0.5,
        origin : { x : 0, y : 0 },
        wavelenght : 0,
        boundary : 0,
        circles : [
            {center:{}, theta:0, intersect:{}, curve:[], cnt:0, color:'#bf616a', hide:false},
            {center:{}, theta:0, intersect:{}, curve:[], cnt:0, color:'#a3be8c', hide:false},
            {center:{}, theta:0, intersect:{}, curve:[], cnt:0, color:'#eccb8b', hide:false},
            {center:{}, theta:0, intersect:{}, curve:[], cnt:0, color:'#81a1c1', hide:false},
            {center:{}, theta:0, intersect:{}, curve:[], cnt:0, color:'#88c0d0', hide:false}
        ],
        active : 3,
        ctx : '',
        pause : false,
    },
    methods : {
        init : function(e) {
            this.boundary = this.origin.x = 0;
            for (var i = 0; i < this.circles.length; i ++) {
                this.circles[i].radius = this.radius / (i + 1);     // 振幅
                this.circles[i].frequency = 1 + 2 * i;              // 频率
                this.boundary += this.circles[i].radius;
                this.origin.x += this.circles[i].radius;
            }
            this.origin.x += 20;
            this.origin.y = this.origin.x;
            this.canvas.height = 2 * this.origin.y
            this.boundary += this.origin.x;
            this.boundary += 50;
            this.wavelenght = parseInt((this.canvas.width - this.boundary) / this.step) - 50;
            
            this.ctx = document.getElementById("Canvas").getContext("2d");
            this.ctx.canvas.width  = this.canvas.width;  //window.innerWidth - 20;
            this.ctx.canvas.height = this.canvas.height;
        },
        iincrease : function() {
            if (this.active < this.circles.length) {
                this.active ++;
            }
            this.redraw();
        },
        ddecrease : function() {
            if (this.active > 1) {
                this.active --;
            }
            this.circles[this.active].curve = [];
            this.circles[this.active].cnt = 0;
            this.redraw();
        },
        hhide : function(index) {
            this.circles[index].hide = !this.circles[index].hide;
            this.redraw();
        },
        ppause : function() {
            this.pause = !this.pause;
        },
        sstep : function() {
            this.pause = true;
            this.recompute();
            this.redraw();
        },
        recompute : function(e) {
            var current_center = this.origin;
            for (var i = 0; i < this.circles.length; i ++) {
                this.circles[i].center = current_center;
                this.circles[i].intersect = {
                    x : current_center.x + Math.cos(this.circles[i].theta) * this.circles[i].radius,
                    y : current_center.y - Math.sin(this.circles[i].theta) * this.circles[i].radius,
                };
                if (i < this.active ) {
                    for (var j = 0; j < this.circles[i].curve.length; j ++) {
                        this.circles[i].curve[j].x += this.step;
                    }
                    this.circles[i].curve[this.circles[i].cnt % this.wavelenght] = {x:this.boundary, y:this.circles[i].intersect.y};
                    this.circles[i].cnt ++;
                }
                this.circles[i].theta = (this.circles[i].theta + Math.PI / 180 * this.circles[i].frequency) % (2 * Math.PI);
                current_center = this.circles[i].intersect;
            }
        },
        redraw : function(e) {
            this.ctx.fillStyle = this.canvas.background;
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0; i < this.active; i ++) {
                if (!this.circles[i].hide) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = this.circles[i].color;
                    this.ctx.strokeStyle = this.circles[i].color;
                    this.ctx.arc(this.circles[i].center.x, this.circles[i].center.y, this.circles[i].radius, 0, 2 * Math.PI);
                    this.ctx.moveTo(this.circles[i].center.x, this.circles[i].center.y);
                    this.ctx.lineTo(this.circles[i].intersect.x, this.circles[i].intersect.y);
                
                    this.ctx.moveTo(this.circles[i].intersect.x, this.circles[i].intersect.y);
                    this.ctx.lineTo(this.boundary, this.circles[i].intersect.y);
                    for (var j = 0; j < this.circles[i].curve.length; j ++) {
                        this.ctx.fillRect(this.circles[i].curve[j].x, this.circles[i].curve[j].y, 1, 1);
                    }
                    this.ctx.stroke();
                }
            }
        },
        refresh : function(e) {
            if (this.pause) {
                return;
            }
            this.recompute();
            this.redraw();
        }        
    },
    mounted : function(){
        this.init();
        setInterval( this.refresh, 5000/360);
    }
})