
var Polygon = (function () {

    // static variables
    var ellipsoid = Cesium.Ellipsoid.WGS84;

    // constructor
    function _(cesiumWidget) {
        this._scene = cesiumWidget.scene;
        this._tooltip = createTooltip(cesiumWidget.container);

        this.initialiseHandlers();

        this.enhancePrimitives();

    }

    _.prototype.initialiseHandlers = function () {
        var scene = this._scene;
        var _self = this;
        // scene events
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function callPrimitiveCallback(name, position) {
            if (_self._handlersMuted == true) return;
            var pickedObject = scene.pick(position);
            if (pickedObject && pickedObject.primitive && pickedObject.primitive[name]) {
                pickedObject.primitive[name](position);
            }
        }
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftClick', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftDoubleClick', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var mouseOutObject;
        handler.setInputAction(
            function (movement) {
                if (_self._handlersMuted == true) return;
                var pickedObject = scene.pick(movement.endPosition);
                if (mouseOutObject && (!pickedObject || mouseOutObject != pickedObject.primitive)) {
                    !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) && mouseOutObject.mouseOut(movement.endPosition);
                    mouseOutObject = null;
                }
                if (pickedObject && pickedObject.primitive) {
                    pickedObject = pickedObject.primitive;
                    if (pickedObject.mouseOut) {
                        mouseOutObject = pickedObject;
                    }
                    if (pickedObject.mouseMove) {
                        pickedObject.mouseMove(movement.endPosition);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftUp', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftDown', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('rightClick', movement.position);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };


    _.prototype.muteHandlers = function (muted) {
        this._handlersMuted = muted;
    };

    // register event handling for an editable shape
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function (surface) {
        var _self = this;
        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function (position) {
            surface.setHighlighted(true);
            if (!surface._editMode) {
                _self._tooltip.showAt(position, "右击取消选区");
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function (position) {
            surface.setHighlighted(true);
            _self._tooltip.setVisible(false);
        });
        setListener(surface, 'leftClick', function (position) {
            surface.setEditMode(true);
        });
        setListener(surface,'rightClick',function () {
            surface.setEditMode(false);
            this._markers=null;
            this._editMarkers=null;
            scene.primitives.remove(surface);
            _self._tooltip.setVisible(false);
        });
        $('#fangqixuanqu,#polygonBox,#rectBox,#selallBtn').click(function () {
            surface.setEditMode(false);
            this._markers=null;
            this._editMarkers=null;
            scene.primitives.remove(surface);
            _self._tooltip.setVisible(false);
        });
    };

    _.prototype.startDrawing = function (cleanUp) {
        // undo any current edit of shapes
        this.disableAllEditMode();
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
        this.muteHandlers(true);
    };

    _.prototype.stopDrawing = function () {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
            this.editCleanUp = null;
        }
        this.muteHandlers(false);
    };

    // make sure only one shape is highlighted at a time
    _.prototype.disableAllHighlights = function () {
        this.setHighlighted(undefined);
    };

    _.prototype.setHighlighted = function (surface) {
        if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface != surface) {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    };

    _.prototype.disableAllEditMode = function () {
        this.setEdited(undefined);
    };
    _.prototype.setEdited = function (surface) {
        if (this._editedSurface && !this._editedSurface.isDestroyed()) {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    };

    var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);

    var defaultShapeOptions = {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false
    };

    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: true
        }),
        material: material,
        granularity: Math.PI / 180.0
    });





    //    Cesium.Polygon.prototype.setStrokeStyle = setStrokeStyle;
    //
    //    Cesium.Polygon.prototype.drawOutline = drawOutline;
    //

    var ChangeablePrimitive = (function () {
        function _() {
        }

        _.prototype.initialiseOptions = function (options) {

            fillOptions(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        };

        _.prototype.setAttribute = function (name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function (name) {
            return this[name];
        };

        _.prototype.update = function (context, frameState, commandList) {

            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },
                                lineWidth: 1.0
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function () {
            return false;
        };

        _.prototype.destroy = function () {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        };

        return _;
    })();


    _.PolygonPrimitive = (function () {

        function _(options) {

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.isPolygon = true;

        }

        _.prototype = new ChangeablePrimitive();


        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };

        _.prototype.getGeometry = function () {

            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function () {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        };

        return _;
    })();




    var defaultBillboard = {
        iconUrl: "imge/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    };

    _.BillboardGroup = function (drawHelper, options) {

        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;

        this._options = copyOptions(options, defaultBillboard);

        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        // keep an ordered list of billboards
        this._orderedBillboards = [];
    };

    _.BillboardGroup.prototype.createBillboard = function (position, callbacks) {

        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            scale: 1.0,
            image: this._options.iconUrl,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
        });

        // if editable
        if (callbacks) {
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;
            function enableRotation(enable) {
                screenSpaceCameraController.enableRotate = enable;
            }
            function getIndex() {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                return i;
            }
            if (callbacks.dragHandlers) {
                var _self = this;
                setListener(billboard, 'leftDown', function (position) {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
                    }
                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
                    }

                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);

                    handler.setInputAction(function (movement) {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                    handler.setInputAction(function (movement) {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);

                    enableRotation(false);

                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                });
            }
            if (callbacks.onDoubleClick) {
                setListener(billboard, 'leftDoubleClick', function (position) {
                    callbacks.onDoubleClick(getIndex());
                });
            }
            if (callbacks.onClick) {
                setListener(billboard, 'leftClick', function (position) {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip) {
                setListener(billboard, 'mouseMove', function (position) {
                    _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function (position) {
                    _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    };


    _.BillboardGroup.prototype.addBillboard = function (position, callbacks) {
        this._orderedBillboards.push(this.createBillboard(position, callbacks));
    };

    _.BillboardGroup.prototype.addBillboards = function (positions, callbacks) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.addBillboard(positions[index], callbacks);
        }
    };

    _.BillboardGroup.prototype.updateBillboardsPositions = function (positions) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.getBillboard(index).position = positions[index];
        }
    };

    _.BillboardGroup.prototype.countBillboards = function () {
        return this._orderedBillboards.length;
    };

    _.BillboardGroup.prototype.getBillboard = function (index) {
        return this._orderedBillboards[index];
    };

    _.BillboardGroup.prototype.removeBillboard = function (index) {
        this._billboards.remove(this.getBillboard(index));
        this._orderedBillboards.splice(index, 1);
    };

    _.BillboardGroup.prototype.remove = function () {
        this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
    };

    _.BillboardGroup.prototype.setOnTop = function () {
        this._scene.primitives.raiseToTop(this._billboards);
    };


    _.prototype.startDrawingPolygon = function (options) {
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    };


    _.prototype.startDrawingPolyshape = function (isPolygon, options) {

        this.startDrawing(
            function () {
                primitives.remove(poly);
                markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var minPoints = isPolygon ? 3 : 2;
        var poly;
        if (isPolygon) {
            poly = new Polygon.PolygonPrimitive(options);
        } else {
            poly = new Polygon.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        primitives.add(poly);

        var positions = [];
        var markers = new _.BillboardGroup(this, defaultBillboard);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                        markers.addBillboard(positions[0]);
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }
                    // add new point to polygon
                    // this one will move with the mouse
                    positions.push(cartesian);
                    // add marker at the new position
                    markers.addBillboard(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    tooltip.showAt(position, "<p>点击绘制第一个点</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // update marker
                        markers.getBillboard(positions.length - 1).position = cartesian;
                        // show tooltip
                        tooltip.showAt(position, "<p>左击添加新点(" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>双击完成绘制</p>" : ""));
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandler.setInputAction(function (movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            // remove overlapping ones
                            var index = positions.length - 1;
                            options.callback(positions);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    };



    _.prototype.enhancePrimitives = function () {

        var drawHelper = this;

        Cesium.Billboard.prototype.setEditable = function () {

            if (this._editable) {
                return;
            }

            this._editable = true;

            var billboard = this;

            var _self = this;

            function enableRotation(enable) {
                drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
            }

            setListener(billboard, 'leftDown', function (position) {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position) {
                    billboard.position = position;
                    _self.executeListeners({ name: 'drag', positions: position });
                }
                function onDragEnd(position) {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({ name: 'dragEnd', positions: position });
                }

                var handler = new Cesium.ScreenSpaceEventHandler(drawHelper._scene.canvas);

                handler.setInputAction(function (movement) {
                    var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    if (cartesian) {
                        onDrag(cartesian);
                    } else {
                        onDragEnd(cartesian);
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                handler.setInputAction(function (movement) {
                    onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                }, Cesium.ScreenSpaceEventType.LEFT_UP);

                enableRotation(false);

            });

            enhanceWithListeners(billboard);

        };

        function setHighlighted(highlighted) {

            var scene = drawHelper._scene;

            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted == highlighted) {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true) {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted) {
                // make sure all other shapes are not highlighted
                drawHelper.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Cesium.Color.fromCssColorString('white'), this.strokeWidth);
            } else {
                if (this._strokeColor) {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                } else {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }

        function setEditMode(editMode) {
            // if no change
            if (this._editMode == editMode) {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            drawHelper.disableAllHighlights();
            // display markers
            if (editMode) {
                drawHelper.setEdited(this);
                var scene = drawHelper._scene;
                var _self = this;
                // create the markers and handlers for the editing
                if (this._markers == null) {
                    var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                    var editMarkers = new _.BillboardGroup(drawHelper, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    function updateHalfMarkers(index, positions) {
                        // update the half markers before and after the index
                        var editIndex = index - 1 < 0 ? positions.length - 1 : index - 1;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = index;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                    }
                    function onEdited() {
                        _self.executeListeners({ name: 'onEdited', positions: _self.positions });
                    }
                    var handleMarkerChanges = {
                        dragHandlers: {
                            onDrag: function (index, position) {
                                _self.positions[index] = position;
                                updateHalfMarkers(index, _self.positions);
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function (index, position) {
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        onDoubleClick: function (index) {
                            if (_self.positions.length < 4) {
                                return;
                            }
                            // remove the point and the corresponding markers
                            _self.positions.splice(index, 1);
                            _self._createPrimitive = true;
                            markers.removeBillboard(index);
                            editMarkers.removeBillboard(index);
                            updateHalfMarkers(index, _self.positions);
                            onEdited();
                        },
                        tooltip: function () {
                            if (_self.positions.length > 3) {
                                return "拖动改变形状\n双击删除点";
                            }
                        }
                    };
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers.addBillboards(_self.positions, handleMarkerChanges);
                    this._markers = markers;
                    function calculateHalfMarkerPosition(index) {
                        var positions = _self.positions;
                        return ellipsoid.cartographicToCartesian(
                            new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).
                                interpolateUsingFraction(0.5)
                        );
                    }
                    var halfPositions = [];
                    var index = 0;
                    var length = _self.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length; index++) {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges = {
                        dragHandlers: {
                            onDragStart: function (index, position) {
                                // add a new position to the polygon but not a new marker yet
                                this.index = index + 1;
                                _self.positions.splice(this.index, 0, position);
                                _self._createPrimitive = true;
                            },
                            onDrag: function (index, position) {
                                _self.positions[this.index] = position;
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function (index, position) {
                                // create new sets of makers for editing
                                markers.insertBillboard(this.index, position, handleMarkerChanges);
                                editMarkers.getBillboard(this.index - 1).position = calculateHalfMarkerPosition(this.index - 1);
                                editMarkers.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges);
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        tooltip: function () {
                            return "拖动添加点";
                        }
                    };
                    editMarkers.addBillboards(halfPositions, handleEditMarkerChanges);
                    this._editMarkers = editMarkers;
                    // add a handler for clicking in the globe
                    this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                    this._globeClickhandler.setInputAction(
                        function (movement) {
                            var pickedObject = scene.pick(movement.position);
                            if (!(pickedObject && pickedObject.primitive)) {
                                _self.setEditMode(false);
                            }
                        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    // set on top of the polygon
                    markers.setOnTop();
                    editMarkers.setOnTop();
                }
                this._editMode = true;
            } else {
                if (this._markers != null) {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = null;
                    this._editMarkers = null;
                    this._globeClickhandler.destroy();
                }
                this._editMode = false;
            }

        }

        Polygon.PolygonPrimitive.prototype.setEditable = function () {

            var polygon = this;
            polygon.asynchronous = false;

            var scene = drawHelper._scene;

            drawHelper.registerEditableShape(polygon);

            polygon.setEditMode = setEditMode;

            polygon.setHighlighted = setHighlighted;

            enhanceWithListeners(polygon);

            polygon.setEditMode(false);

        }

    };

    _.DrawHelperWidget = (function () {

        // constructor
        function _(drawHelper, options) {

            // container must be specified
            if (!(Cesium.defined(options.container))) {
                throw new Cesium.DeveloperError('Container is required');
            }

            var drawOptions = {
                polygonIcon: "img/selmorerect.png"
            };

            fillOptions(options, drawOptions);

            var _self = this;

            var toolbar = document.createElement('DIV');
            toolbar.className = "polygonBox";
            options.container.appendChild(toolbar);

            function addIcon(id, url, title, callback) {
                var div = document.createElement('DIV');
                div.className = 'button';
                div.title = title;
                toolbar.appendChild(div);
                div.onclick = callback;
                var image = document.createElement('IMG');
                image.style.width = "80px";
                image.style.height = "80px";
                image.src = url;
                div.appendChild(image);
                return div;
            }

            var scene = drawHelper._scene;

            addIcon('polygon', options.polygonIcon, '绘制多边形', function () {
                drawHelper.startDrawingPolygon({
                    callback: function (positions) {
                        _self.executeListeners({ name: 'polygonCreated', positions: positions });
                    }
                });
            });

            enhanceWithListeners(this);

        }

        return _;

    })();

    _.prototype.addToolbar = function (container, options) {
        options = copyOptions(options, { container: container });
        return new _.DrawHelperWidget(this, options);
    };



    function createTooltip(frameDiv) {

        var tooltip = function (frameDiv) {

            var div = document.createElement('DIV');
            div.className = "twipsy right";

            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);

            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);

            this._div = div;
            this._title = title;

            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        };

        tooltip.prototype.setVisible = function (visible) {
            this._div.style.display = visible ? 'block' : 'none';
        };

        tooltip.prototype.showAt = function (position, message) {
            if (position && message) {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 10 + "px";
                this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
            }
        };

        return new tooltip(frameDiv);
    }


    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }

    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }

// shallow copy
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options), option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element) {

        element._listeners = {};

        element.addListener = function (name, callback) {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        };

        element.executeListeners = function (event, defaultCallback) {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            } else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        }

    }

    return _;
})();

