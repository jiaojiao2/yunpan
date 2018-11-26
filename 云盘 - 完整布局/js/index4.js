(function () {
    //自己
    function findself(id) {
        return treeData.filter((item) => (item.id === (+id)))[0];
    }

    //子集
    function findChild(id) {
        return treeData.filter((item) => (item.pid === id));
    }

    //所有子集
    function childrens(id, array) {
        let childs = findChild(id).map(item=> {
            return item.id
        });
        if (childs.length == 0) {
            return;
        }
        array.push.apply(array, childs);
        childs.forEach(i => {
            childrens(i, array);
        });
    }


    //找到所有父级ID
    function findParents(id) {
        let self = findself(id);
        if (!self) {
            return
        }
        let parents = [];
        let parent = treeData.filter((item) => (item.id === self.pid))[0];
        if (parent) {
            parents.push(parent);
            parents = parents.concat(findParents(parent.id))
        }
        return parents;
    }

    //console.log(findChild(0), findParents(2), findself(0));

    //试图渲染
    //菜单渲染
    let treeMenu = document.querySelector(".tree-menu");
    let root = -1;
    let level = 0;
    let nowId = 0;
    let time = 0;
    initMenu();


    //生成树列表内容
    function creatMenu(id, level) {
        level++;
        let parts = findParents(nowId);
        if (!parts) {
            parts = [];
        }
        parts.push(findself(nowId));
        let inner = "<ul>";
        findChild(id).forEach(item => {
            let child = findChild(item.id);
            /*class="${parts.includes(item) ? "open" : ""}"*/
            inner += `<li class="${parts.includes(item) ? "open" : ""}">
                            <p class="${child.length > 0 ? "has-child" : ""} ${nowId == item.id ? "active" : ""}" data-id="${item.id}" style="padding-left: ${level * 20}px">
                                <span><i></i>${item.title}</span>
                            </p>
                            ${child.length > 0 ? creatMenu(item.id, level + 1) : ""}
                        </li>`;
        });
        inner += "</ul>";
        return inner;
    }


    //导航渲染
    let showNowId = findChild(root)[0].id;

    function creatNav(id) {
        let breadNav = document.querySelector('.bread-nav');
        let self = findself(id);
        let parents = findParents(id).reverse();
        // console.log(parents, self)
        let inner = "";
        parents.forEach(item => {
            inner += `<a href="javascript:;" data-id="${item.id}">${item.title}</a>`
        });
        inner += `<span data-id="${id}">${self.title}</span>`;
        breadNav.innerHTML = inner;
    }

    creatNav(showNowId);

    //文件夹渲染
    function createlist(id) {
        let folders = document.querySelector("#folders");
        let child = findChild(id);
        let childInner = "";
        child.forEach(item => {
            childInner += `<li class="folder-item  " data-id="${item.id}">
                    <img src="img/folder-b.png" alt="">
                    <span class="folder-name">${item.title}</span>
                    <input type="text" class="editor" value="${item.title}">
                    <label class="checked">
                        <input type="checkbox" />
                        <span class="iconfont icon-checkbox-checked"></span>
                    </label>   
                </li>`;
        });
        folders.innerHTML = childInner;
        allSelect();
    }

    createlist(showNowId);


    /*treeMenu.addEventListener("click", function (e) {
     let item = e.target;
     if (!e.target.classList.contains("has-child")) {
     return true;
     }
     document.querySelectorAll(".active").forEach(j => {
     j.classList.remove("active")
     });
     item.parentElement.classList.toggle("open");
     nowId = Number(item.getAttribute("data-id"));
     //重新渲染数据
     treeMenu.innerHTML = creatMenu(root, level);
     creatNav(nowId);
     createlist(nowId)
     })*/

    //点击树形列表的切换
    function initMenu(i) {
        let moveinner = document.querySelector(".move-alert-menu");
        if(!i){
            treeMenu.innerHTML = creatMenu(root, level);
        }

        moveinner.innerHTML = creatMenu(root, level);
        let P = document.querySelectorAll("li>p");
        P.forEach(item => {
            item.addEventListener("click", function (e) {
                if(contains(moveinner, e.target)){
                    nowId = Number(item.getAttribute("data-id"));
                   initMenu(1);
                   return null;
                }
                nowId = Number(item.getAttribute("data-id"));
                //重新渲染数据
                // treeMenu.innerHTML = creatMenu(root, level);
                initMenu();
                creatNav(nowId);
                createlist(nowId)
            })
        });
    }


    //点击导航的切换
    let nav = document.querySelector(".bread-nav");
    nav.addEventListener("click", function (e) {
        if (e.target.tagName.toLowerCase() === "a") {
            nowId = Number(e.target.getAttribute("data-id"));
            //重新渲染数据
            // treeMenu.innerHTML = creatMenu(root, level);
            initMenu();
            creatNav(nowId);
            createlist(nowId);
            let treeList = Array.from(document.querySelectorAll(".has-child"));
            // console.log(treeList);
            treeList.filter(item => {
                let treeListId = item.getAttribute("data-id");
                if (treeListId == nowId) {
                    let childs = Array.from(item.nextElementSibling.querySelectorAll(".has-child"));
                    childs.forEach(i => {
                        i.parentElement.classList.remove("open")
                    })
                }
            })
        }
    });

    //点击列表切换
    let folders = document.querySelector("#folders");
    //双击修改名称
    folders.addEventListener("dblclick", function (e) {
        if (e.target.className === "folder-name") {//重置名称
            //先判断li是否选中状态？选中就不支持重命名，不选中时支持重命名
            if(e.target.parentElement.classList.contains("active")){
                return null;
            }
            nowId = Number(e.target.parentElement.getAttribute("data-id"));
            let inputText = e.target.nextElementSibling;
            e.target.style.display = "none";
            inputText.style.display = "block";
            inputText.focus();
            let span = e.target;
            //操作输入框
            //失去焦点
            inputText.onblur = function () {
                span.style.display = "block";
                inputText.style.display = "none";
            };
            //失去焦点、内容改变时，输入框消失，data数据改变
            inputText.onchange = function () {
                span.style.display = "block";
                inputText.style.display = "none";
                titleChange({
                    id: nowId,
                    title: e.target.nextElementSibling.value
                });
                //获取父级的id，再渲染
                let partentID = findParents(nowId)[0].id;
                // treeMenu.innerHTML = creatMenu(root, level);
                initMenu();
                creatNav(partentID);
                createlist(partentID);
                //提示信息修改完成
                success("修改名称已完成！")

            }
        }
    });
    //单击做的事情
    folders.addEventListener("click", function (e) {
        // console.log(e.target.tagName);
        //点击到图片就打开它的下一级文件
        if (e.target.tagName.toLowerCase() === "img") {
            nowId = Number(e.target.parentElement.getAttribute("data-id"));
            //判断有没有子集
            let childs = findChild(nowId);
            //if (childs.length > 0) {
            // treeMenu.innerHTML = creatMenu(root, level);
            initMenu();
            creatNav(nowId);
            createlist(nowId)
            //} else {
            //return null;
            //}
        } else if (e.target.checked == true) {//选中
            e.target.parentNode.parentNode.classList.add("active");
            let nowID = Number(e.target.parentNode.parentNode.getAttribute("data-id"));
            addAttr({
                id: nowID,
                checked: "checked"
            });
            allSelect();
        } else if (e.target.checked == false) {//没选中
            let nowID = Number(e.target.parentNode.parentNode.getAttribute("data-id"));
            e.target.parentNode.parentNode.classList.remove("active");
            allSelect();
            removeAttr(nowID)
        }
    });
    //鼠标按下事件
    folders.addEventListener("mousedown", function (e) {
        //事件发生在选中的li上
        if (e.target.classList.contains("active")) {
            let delBtn = document.querySelector(".del-btn");
            let checkedLi = Array.from(document.querySelectorAll("#folders .active"));
            //提示框出现
            let div = document.querySelector(".tishi");
            div.innerHTML = `已选中${checkedLi.length}条`;
            div.style.display = "block";
            css(div, 'left', e.clientX);
            css(div, 'top', e.clientY);
            //移动范围
            let box = document.querySelector("#page");
            //选中删除的li，移动时提示框的变化
            let liMove = function (e) {
                let div = document.querySelector(".tishi");
                css(div, 'left', e.clientX);
                css(div, 'top', e.clientY);
            };
            box.addEventListener("mousemove", liMove);
            document.addEventListener("mouseup", function () {
                box.removeEventListener("mousemove", liMove);
                let div = document.querySelector(".tishi");
                //检测碰撞删除
                if (isBoon(delBtn, div)) {
                    success("文件删除成功！");
                    div.style.display = "none";
                    //data数据改变
                    //所有子集id
                    let array2 = [];
                    let array = treeData.filter(item=> {
                        return item.checked
                    }).map(item=> {
                        return item.id
                    });
                    array.forEach(item=> {
                        array2.push(item);
                        childrens(item, array2)
                    });
                    let pid = findself(array[0]).pid;
                    //删除数据
                    treeData = treeData.filter(item=> {
                        return array2.indexOf(item.id) < 0;
                    });
                    nowId=pid;
                    initMenu();
                    creatNav(pid);
                    createlist(pid)
                }
                div.style.display="none";
            }, {
                once: true
            });
        }
    });

    //全选
    let checkedAll = document.querySelector("#checked-all");
    checkedAll.addEventListener("change", function () {
        document.querySelectorAll("#folders input[type='checkbox']").forEach(item => {
            let nowID = Number(item.parentNode.parentNode.getAttribute("data-id"));
            item.checked = this.checked;
            if (this.checked) {
                item.parentNode.parentNode.classList.add("active");
                addAttr({
                    id: nowID,
                    checked: "checked"
                })
            } else {
                item.parentNode.parentNode.classList.remove("active");
                removeAttr(nowID)
            }
        })
    });

    //全选判断
    function allSelect() {
        let allList = document.querySelectorAll(".folder-item");
        let checkedAll = document.querySelector("#checked-all");
        let activeList = document.querySelectorAll("#folders .active");
        if (allList.length == activeList.length && activeList.length > 0) {
            checkedAll.checked = true
        } else {
            checkedAll.checked = false
        }
    }

    //delet的取消
    let deletclos=document.querySelector(".confirm .clos");
    let deletconfirmBtns=document.querySelectorAll(".confirm .confirm-btns a");
    deletclos.addEventListener("click",function(){

        hiddeConfirm();
    });
    deletconfirmBtns[1].addEventListener("click",hiddeConfirm);
    //点击删除按钮
   document.querySelector(".del-btn").onclick=function(){
       let array = treeData.filter(item=> {
           return item.checked
       }).map(item=> {
           return item.id
       });
       if (array.length == 0) {
           warning("请选择要删除的文件！");
           return;
       }
       confirm();
   };
    deletconfirmBtns[0].addEventListener("click", function () {
        let array2 = [];
        let array = treeData.filter(item=> {
            return item.checked
        }).map(item=> {
            return item.id
        });
        if (array.length == 0) {
            warning("请选择要删除的文件！");
            return;
        }
        array.forEach(item=> {
            array2.push(item);
            childrens(item, array2)
        });
        let pid = findself(array[0]).pid;
        //删除数据
        treeData = treeData.filter(item=> {
            return array2.indexOf(item.id) < 0;
        });
        nowId=pid;
        initMenu();
        creatNav(pid);
        createlist(pid);
        success("删除文件夹成功！！！");
        hiddeConfirm();
    });

    //新建文件夹
    let creatBtn = document.querySelector(".create-btn");
    creatBtn.addEventListener("click", function () {
        //获取导航里id（当前要新建的父级）
        let dataID = document.querySelector(".bread-nav span").getAttribute("data-id");
        let pid = +dataID;
        let allNew = findChild(pid).filter(item=> {
            return item.title.indexOf('新建文件夹') === 0
        }).sort(function (n1, n2) {
            if (!n2) {
                return 1;
            }
            return parseInt(n1.title.substring(5).length == 0 ? '0' : n1.title.substring(5)) - parseInt(n2.title.substring(5).length == 0 ? '0' : n2.title.substring(5));
        });
        let currentName = "新建文件夹";
        let prevId = null;
        if (allNew.length != 0) {
            if (allNew[0].title === currentName) {
                for (let i = 0; i < allNew.length; i++) {
                    let title = allNew[i].title;
                    if (i == 0) {
                        title = '新建文件夹0';
                    }
                    if (allNew[i + 1] && title != '新建文件夹' + (parseInt(allNew[i + 1].title.substring(5)) - 1)) {
                        currentName = "新建文件夹" + (i + 1);
                        prevId = allNew[i].id;
                        break;
                    } else {
                        currentName = "新建文件夹" + (i + 1);
                        prevId = allNew[i].id;
                    }
                }
            }
        }
        let maxId = treeData.map(item=> {
            return item.id
        }).reduce((n1, n2) => {
            return n1 > n2 ? n1 : n2
        });

        let id = maxId + 1;
        let inserData = {
            id: id,
            title: currentName,
            pid: +pid
        };
        let prevIndex = null;
        if (prevId) {
            treeData.forEach((item, index) => {
                if (item.id === prevId) {
                    prevIndex = index;
                }
            });
        }

        if (prevId == null || prevIndex == null) {
            treeData.push(inserData);
        } else {
            treeData.splice(prevIndex + 1, 0, inserData);
        }
        createlist(+pid);
        initMenu();
        creatNav(+pid);
        success('新建文件夹成功!!!')
    });

    //移动文件夹
    let moveBtn = document.querySelector(".move-btn");
    moveBtn.addEventListener("click", function () {
        let checkedLi = Array.from(document.querySelectorAll("#folders .active"));
        if(checkedLi==0){
            warning("请选择文件！！！");
            return;
        }
        moveAert();
    });

    //移动文件夹事件
    let clos=document.querySelector(".clos");
    let confirmBtns=document.querySelectorAll(".confirm-btns a");
    clos.addEventListener("click",function(){
        hideAert()
    });
    confirmBtns[1].addEventListener("click",hideAert);
    confirmBtns[0].addEventListener("click",function(){
        let selectID= Array.from(document.querySelectorAll("#folders .active")).map(item=>{
            return +item.getAttribute("data-id");
        });
        let nowselectID= +document.querySelector(".move-alert-menu .active").getAttribute("data-id");
        selectID.forEach(item=>{
            let self=findself(item);
            self.pid=nowselectID;
        });
        nowId=nowselectID;
        initMenu();
        creatNav(nowselectID);
        createlist(nowselectID);
        hideAert();
        success("移动文件夹成功！！！")
    });

    //框选
    /*
     1、画框
     2、碰撞
     3、选中
     4、修改data
     */

    //画框
    (function () {
        let box = null;
        let mouseStart = {};
        let folders = document.querySelector("#folders");
        folders.addEventListener("mousedown", function (e) {
            // e.preventDefault();
            let clickLi = Array.from(document.querySelectorAll('.folder-item')).some(item => {
                return contains(item, e.target)
            });
            //只有点击左键可以执行
            if (e.button != 0 || clickLi) {//不能在li上画框，包括li里面的元素
                return true;
            }
            mouseStart = {
                x: e.clientX,
                y: e.clientY
            };
            box = document.createElement("div");
            box.className = "boxdiv";
            document.body.appendChild(box);
            document.addEventListener("mousemove", move);
            //检测碰撞
            document.addEventListener("mouseup", function () {
                document.removeEventListener("mousemove", move);
                document.body.removeChild(box);
            }, {
                once: true
            });
        });

        //画框的
        function move(e) {
            let nowMouse = {
                x: e.clientX,
                y: e.clientY
            };
            //取绝对值
            let cha = {
                x: Math.abs(nowMouse.x - mouseStart.x),
                y: Math.abs(nowMouse.y - mouseStart.y)
            };
            css(box, "width", cha.x);
            css(box, "height", cha.y);
            //小的值为top和left
            css(box, "left", Math.min(mouseStart.x, nowMouse.x));
            css(box, "top", Math.min(mouseStart.y, nowMouse.y));
            let lis = document.querySelectorAll(".folder-item");
            lis.forEach(li => {
                if (isBoon(box, li)) {
                    li.classList.add("active");
                    li.querySelector("input[type='checkbox']").checked = true;
                    let nowID = Number(li.getAttribute("data-id"));
                    addAttr({
                        id: nowID,
                        checked: "checked"
                    });
                    allSelect();
                } else {
                    let nowID = Number(li.getAttribute("data-id"));
                    li.classList.remove("active");
                    li.querySelector("input[type='checkbox']").checked = false;
                    allSelect();
                    removeAttr(nowID)
                }
            })
        }
    })();



    //重命名
    function titleChange(op) {
        treeData.forEach(item => {
            if (item.id == op.id) {
                item.title = op.title
            }
        })
    }

    //添加属性
    function addAttr(op) {
        treeData.forEach(item => {
            if (item.id == op.id) {
                item.checked = op.checked
            }
        })
    }

    //移除属性
    function removeAttr(id) {
        treeData.forEach(item => {
            if (item.id == id) {
                delete item.checked;
            }
        })
    }

    //成功信息提示
    function success(text) {
        let alertSuccess = document.querySelector(".alert-success");
        mTween({
            el: alertSuccess,
            attr: {
                top: 0,
                opacity: 1
            },
            time: 20,
            cb: function () {
                clearTimeout(time);
                time = setTimeout(function () {
                    mTween({
                        el: alertSuccess,
                        attr: {
                            top: -100,
                            opacity: 0
                        },
                        time: 20
                    })
                }, 2000);
            }
        });
        alertSuccess.innerHTML = text
    }

    //警告信息提示
    function warning(text) {
        let alertWarning = document.querySelector(".alert-warning");
        mTween({
            el: alertWarning,
            attr: {
                top: 0,
                opacity: 1
            },
            time: 20,
            cb: function () {
                clearTimeout(time);
                time = setTimeout(function () {
                    mTween({
                        el: alertWarning,
                        attr: {
                            top: -100,
                            opacity: 0
                        },
                        time: 20
                    })
                }, 2000);
            }
        });
        alertWarning.innerHTML = text
    }

    //移动文件夹信息提示
    function moveAert() {
        let moveAert = document.querySelector(".move-alert");
        mTween({
            el: moveAert,
            attr: {
                top: 400,
                opacity: 1
            },
            time: 20
        });
    }

    //移动文件夹信息提示
    function hideAert() {
        let moveAert = document.querySelector(".move-alert");
        mTween({
            el: moveAert,
            attr: {
                top: -400,
                opacity: 0
            },
            time: 20
        });
    }

    //删除文件夹信息提示
    function confirm() {
        let confirm = document.querySelector(".confirm");
        mTween({
            el: confirm,
            attr: {
                top: 300,
                opacity: 1
            },
            time: 20
        });
    }

    //隐藏删除文件夹信息提示
    function hiddeConfirm() {
        let confirm = document.querySelector(".confirm");
        mTween({
            el: confirm,
            attr: {
                top: -300,
                opacity: 0
            },
            time: 20
        });
    }


})();


